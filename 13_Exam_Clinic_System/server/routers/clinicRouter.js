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


router.get('/patients', isAuthenticated, authorizeRoles("admin", "coordinator"), (req, res) => {
  try {
    const patients = db.prepare(`
      SELECT * FROM patients
    `).all();

    const decryptedPatients = patients.map((patient) => ({
      ...patient,
      cpr_encrypted: decryptCPR(patient.cpr_encrypted)
    }));

    return res.send({ data: decryptedPatients });

  } catch (err) {
    console.error(err);
    return res.status(500).send({ errorMessage: 'Failed to fetch patients' });
  }
});


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

export default router;