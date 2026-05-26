import { Router } from 'express';
import db from '../database/db.js';
import { encryptCPR,decryptCPR } from '../utils/encryption.js';
import { isAuthenticated, authorizeRoles } from '../utils/auth.js';

const router = Router();

 /*
This API follows a role-based healthcare management architecture built on REST principles with strong authorization boundaries and transactional consistency.

 *
 * 1. ROOM RESOURCE (/rooms/*)
 *    - Public endpoint for basic room listing
 *    - Protected room details require authentication + elevated roles
 *    - Rooms represent physical capacity and occupancy state
 *
 * 2. PATIENT RESOURCE (/patients/*)
 *    - Core domain entity representing hospital patients
 *    - Supports admin/coordinator access for full patient overview
 *    - Includes encrypted CPR data (decrypted only server-side when needed)
 *    - Supports assignment to rooms and nurses
 *
 *    Key patient operations:
 *      - /patients (admin/coordinator): full patient listing
 *      - /patients/:id/room (admin/coordinator): assign patient to room
 *      - /patients/:id/confirm (admin/nurse): reset patient after treatment cycle
 *
 * 3. NURSE WORKFLOW (/patients/assignment, /patients/:id/blood-samples)
 *    - Nurse-specific workload distribution system
 *    - Implements atomic patient assignment using SQL transactions
 *    - Ensures only one nurse can claim a patient at a time
 *    - Provides access to patient blood samples for medical handling
 *
 * 4. BLOOD SAMPLE RESOURCE (/blood-samples/*)
 *    - Tracks lifecycle of medical samples (collected → cooling → sent)
 *    - State transitions are strictly sequential and controlled
 *    - Only nurses can update sample status
 *
 * 5. SECURITY MODEL
 *    - Session-based authentication (req.session.user)
 *    - Role-based authorization:
 *        - admin: full system access + statistics + patient management
 *        - coordinator: patient/room management
 *        - nurse: patient assignment + medical workflows
 *    - Sensitive fields (CPR) are encrypted at rest and decrypted only when needed
 *
 * 6. TRANSACTION SAFETY
 *    - Critical operations use SQL transactions (BEGIN / COMMIT / ROLLBACK)
 *    - Prevents race conditions in:
 *        - room assignment
 *        - nurse patient claiming
 *        - patient state resets
 *
 * 7. SYSTEM BEHAVIOR
 *    - Patient lifecycle is tightly controlled through status transitions:
 *        registered → waiting → in_room → (reset to waiting)
 *    - Room occupancy is synchronized with patient assignment
 *    - Blood samples follow strict sequential processing pipeline
 */

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
            u.email
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


router.patch(
  '/patients/:id/room',
  isAuthenticated,
  authorizeRoles('admin', 'coordinator'),
  (req, res) => {
    try {
      const patientId = req.params.id;
      const { roomId } = req.body;

      if (!roomId) {
        return res.status(400).send({
          errorMessage: 'roomId required'
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
      try { db.exec('ROLLBACK'); } catch {}

      console.error(err);

      return res.status(500).send({
        errorMessage: 'Server error'
      });
    }
  }
);

router.post(
  '/patients/assignment',
  isAuthenticated,
  authorizeRoles('nurse'),
  (req, res) => {
    try {
      const nurseId = req.session.user.id;

      db.exec('BEGIN IMMEDIATE');

      let patient = db.prepare(`
        SELECT p.*, r.name AS roomName
        FROM patients p
        LEFT JOIN rooms r ON p.room_id = r.id
        WHERE p.nurse_id = ?
        AND p.status = 'in_room'
        LIMIT 1
      `).get(nurseId);

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

router.get(
  '/patients/:id/blood-samples',
  isAuthenticated,
  authorizeRoles('nurse'),
  (req, res) => {
    try {
      const patientId = req.params.id;

      const samples = db.prepare(`
        SELECT *
        FROM blood_samples
        WHERE patient_id = ?
      `).all(patientId);

      return res.send({ data: samples });

    } catch (error) {
      console.error(error);

      return res.status(500).send({
        errorMessage: 'Server error'
      });
    }
  }
);

router.patch(
  '/blood-samples/:id',
  isAuthenticated,
  authorizeRoles('nurse'),
  (req, res) => {
    try {
      const sampleId = req.params.id;

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

      if (sample.status === 'collected') nextStatus = 'cooling';
      else if (sample.status === 'cooling') nextStatus = 'sent';

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
router.post(
  '/patients/:id/confirm',
  isAuthenticated,
  authorizeRoles('admin', 'nurse'),
  (req, res) => {
    try {
      const patientId  =  req.params.id;

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
        const allReady = samples.every(
          sample => sample.status !== 'collected'
        );
  
        if (!allReady) {
          return res.status(400).send({
            errorMessage: 'Cannot reset patient until all blood samples are processed'
          });
        }

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