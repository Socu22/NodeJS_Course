import db from '../database/db.js';

// notice: All timestamps are stored and processed in UTC to ensure global consistency across all servers and user time zones.
// in denmark utc time is ourTime - 2 hours.

export function resetInactivePatientsJob(timeoutMinutes = 60) { // The condition is that x minuttes has gone by since last patients/activity 
  try {
    db.exec('BEGIN');

    // sets room free of an inactive patient
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
    // makes an inactive patient, inactive according to workflow.
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
