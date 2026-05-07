import { Router } from 'express';
import db from '../database/db.js';
import { encryptCPR,decryptCPR } from '../utils/encryption.js';
import { isAuthenticated, authorizeRoles } from '../utils/auth.js';

const router = Router();

router.get('/rooms' ,(req, res) => {
  try {
    const rooms = db.prepare(`
      SELECT * FROM rooms
    `).all();

    return res.send({ data: rooms });
  } catch (err) {
    return res.status(500).send({ errorMessage: 'Failed to fetch rooms' });
  }
});
router.get('/rooms/:id', isAuthenticated, authorizeRoles("admin", "coordinator"), (req, res) => {
    try {
        const room = db.prepare(`
            SELECT * FROM rooms WHERE id = ?
        `).get(req.params.id);

        if (!room) {
            return res.status(404).send({
                errorMessage: 'Room not found'
            });
        }

        res.send({ data: room });

    } catch (err) {
        console.error(err);
        res.status(500).send({
            errorMessage: 'Server error'
        });
    }
});


router.get(
  '/patients',
  isAuthenticated,
  authorizeRoles('admin', 'coordinator'),
  (req, res) => {
    try {
      const patients = db.prepare(`
        SELECT
          p.id,
          p.status,
          p.user_id,
          p.room_id,
          p.nurse_id,
          p.cpr_encrypted,

          u.username,
          u.email,
          u.created_at
        FROM patients p
        LEFT JOIN users u
          ON p.user_id = u.id
      `).all();

      const decryptedPatients = patients.map((patient) => ({
        ...patient,
        cpr_decrypted: decryptCPR(patient.cpr_encrypted)
      }));

      return res.send({
        data: decryptedPatients
      });

    } catch (err) {
      console.error(err);

      return res.status(500).send({
        errorMessage: 'Failed to fetch patients'
      });
    }
  }
);


router.post('/assign-room', isAuthenticated, authorizeRoles("admin","coordinator"),(req, res) => {
  try {
    const patientId = Number(req.body.patientId);
    const roomId = Number(req.body.roomId);

    if (!patientId || !roomId) {
      return res.status(400).send({
        errorMessage: 'patientId and roomId required'
      });
    }

    const room = db.prepare(`
      SELECT * FROM rooms WHERE id = ?
    `).get(roomId);

    if (!room) {
      return res.status(404).send({
        errorMessage: 'Room not found'
      });
    }

    if (room.status === 'occupied') {
      return res.status(400).send({
        errorMessage: 'Room already occupied'
      });
    }

    const patient = db.prepare(`
      SELECT * FROM patients WHERE id = ?
    `).get(patientId);

    if (!patient) {
      return res.status(404).send({
        errorMessage: 'Patient not found'
      });
    }

    db.exec('BEGIN');

    db.prepare(`
      UPDATE patients
      SET room_id = ?, status = 'in_room'
      WHERE id = ?
    `).run(roomId, patientId);

    db.prepare(`
      UPDATE rooms
      SET status = 'occupied'
      WHERE id = ?
    `).run(roomId);

    db.exec('COMMIT');

    return res.send({
      successMessage: 'Patient assigned successfully'
    });

  } catch (err) {
    try {
      db.exec('ROLLBACK');
    } catch {}

    console.error(err);

    return res.status(500).send({
      errorMessage: err.message
    });
  }
});
router.get(
  '/assign-patient',
  isAuthenticated,
  authorizeRoles('nurse'),
  (req, res) => {
    try {
      const nurseId = req.session.user.id;

      db.exec('BEGIN IMMEDIATE');

      // 1. check already assigned patient
      let patient = db.prepare(`
        SELECT p.*, r.name AS roomName
        FROM patients p
        LEFT JOIN rooms r ON p.room_id = r.id
        WHERE p.nurse_id = ?
        AND p.status = 'in_room'
        LIMIT 1
      `).get(nurseId);

      // 2. if none, CLAIM one atomically
      if (!patient) {
        const candidate = db.prepare(`
          SELECT id
          FROM patients
          WHERE status = 'in_room'
          AND nurse_id IS NULL
          ORDER BY id
          LIMIT 1
        `).get();

        if (candidate) {
          db.prepare(`
            UPDATE patients
            SET nurse_id = ?
            WHERE id = ?
            AND nurse_id IS NULL
          `).run(nurseId, candidate.id);

          patient = db.prepare(`
            SELECT p.*, r.name AS roomName
            FROM patients p
            LEFT JOIN rooms r ON p.room_id = r.id
            WHERE p.id = ?
          `).get(candidate.id);
        }
      }

      db.exec('COMMIT');

      if (!patient) {
        return res.send({ data: null });
      }

      patient.cpr = decryptCPR(patient.cpr_encrypted);
      delete patient.cpr_encrypted;

      return res.send({ data: patient });

    } catch (err) {
      try { db.exec('ROLLBACK'); } catch {}

      console.error(err);
      return res.status(500).send({
        errorMessage: 'Server error'
      });
    }
  }
);

router.post(
  '/blood-samples',
  isAuthenticated,
  authorizeRoles('nurse'),
  (req, res) => {
    try {
      const { patientId } = req.body;

      if (!patientId) {
        return res.status(400).send({
          errorMessage: 'Missing patientId'
        });
      }

      const samples = db.prepare(`
        SELECT *
        FROM blood_samples
        WHERE patient_id = ?
      `).all(patientId);

      return res.send({
        data: samples
      });

    } catch (error) {
      console.error(error);

      return res.status(500).send({
        errorMessage: 'Server error'
      });
    }
  }
);
router.patch(
  '/blood-samples',
  isAuthenticated,
  authorizeRoles('nurse'),
  (req, res) => {
    try {
      const { sampleId } = req.body;

      if (!sampleId) {
        return res.status(400).send({
          errorMessage: 'Missing sampleId'
        });
      }

      const sample = db.prepare(`
        SELECT *
        FROM blood_samples
        WHERE id = ?
      `).get(sampleId);

      if (!sample) {
        return res.status(404).send({
          errorMessage: 'Sample not found'
        });
      }

      let nextStatus = sample.status;

      if (sample.status === 'collected') {
        nextStatus = 'cooling';
      } else if (sample.status === 'cooling') {
        nextStatus = 'sent';
      }

      db.prepare(`
        UPDATE blood_samples
        SET status = ?
        WHERE id = ?
      `).run(nextStatus, sampleId);

      return res.send({
        message: `Sample updated to ${nextStatus}`
      });

    } catch (error) {
      console.error(error);

      return res.status(500).send({
        errorMessage: 'Server error'
      });
    }
  }
);
router.patch(
  '/patients/confirm',
  isAuthenticated,
  authorizeRoles('admin', 'nurse'),
  (req, res) => {
    try {
      const { patientId } = req.body;

      if (!patientId) {
        return res.status(400).send({
          errorMessage: 'Missing patientId'
        });
      }

      const samples = db.prepare(`
        SELECT status
        FROM blood_samples
        WHERE patient_id = ?
      `).all(patientId);

      if (samples.length === 0) {
        return res.status(404).send({
          errorMessage: 'No blood samples found'
        });
      }

      const allReady = samples.every(
        sample => sample.status !== 'collected'
      );

      if (!allReady) {
        return res.status(400).send({
          errorMessage: 'Cannot reset patient until all blood samples are processed'
        });
      }

      db.exec('BEGIN');

      const patient = db.prepare(`
        SELECT room_id
        FROM patients
        WHERE id = ?
      `).get(patientId);

      if (!patient) {
        db.exec('ROLLBACK');

        return res.status(404).send({
          errorMessage: 'Patient not found'
        });
      }

      if (patient.room_id) {
        db.prepare(`
          UPDATE rooms
          SET status = 'free'
          WHERE id = ?
        `).run(patient.room_id);
      }

      db.prepare(`
        UPDATE patients
        SET
          status = 'waiting',
          room_id = NULL,
          nurse_id = NULL
        WHERE id = ?
      `).run(patientId);

      db.exec('COMMIT');

      return res.send({
        message: 'Patient confirmed successfully'
      });

    } catch (error) {
      try {
        db.exec('ROLLBACK');
      } catch {}

      console.error(error);

      return res.status(500).send({
        errorMessage: 'Server error'
      });
    }
  }
);
export default router;