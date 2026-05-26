import db from '../database/db.js';

export function resetInactivePatientsJob(timeoutMinutes = 60) {
  try {
    db.exec('BEGIN');

    db.prepare(`
      UPDATE rooms
      SET status = 'free'
      WHERE id IN (
        SELECT room_id
        FROM patients
        WHERE status != 'registered'
          AND room_id IS NOT NULL
          AND datetime(last_activity, '+' || ? || ' minutes') < CURRENT_TIMESTAMP
      )
    `).run(timeoutMinutes);

    db.prepare(`
      UPDATE patients
      SET
        status = 'registered',
        room_id = NULL,
        nurse_id = NULL
      WHERE status != 'registered'
        AND datetime(last_activity, '+' || ? || ' minutes') < CURRENT_TIMESTAMP
    `).run(timeoutMinutes);

    db.exec('COMMIT');

  } catch (err) {
    try {
      db.exec('ROLLBACK');
    } catch {}

    console.error('resetInactivePatientsJob failed:', err);
  }
}
export function updatePatientActivity(userId) {
  db.prepare(`
    UPDATE patients
    SET last_activity = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(userId);
}