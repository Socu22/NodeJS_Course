import { DatabaseSync } from 'node:sqlite';
import { resetInactivePatientsJob } from '../jobs/patientsJob.js';

const db = new DatabaseSync('clinicDatabase.db');

const deleteMode = process.argv.includes("--delete");

import {
  bcryptPassword,
  encryptCPR,
  decryptCPR
} from '../utils/encryption.js';

async function initializeDatabase() {
  try {
    if (deleteMode) {
      db.exec('DROP TABLE IF EXISTS blood_samples;');
      db.exec('DROP TABLE IF EXISTS patients;');
      db.exec('DROP TABLE IF EXISTS rooms;');
      db.exec('DROP TABLE IF EXISTS users;');
    }

    db.exec(`PRAGMA foreign_keys = ON;`);

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT UNIQUE,
        role TEXT DEFAULT 'user',
        reset_token TEXT,
        reset_token_expiry INTEGER
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT CHECK(status IN ('free','occupied')) DEFAULT 'free'
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        cpr_encrypted TEXT UNIQUE NOT NULL,
        status TEXT CHECK (status IN ('registered','waiting','in_room')) DEFAULT 'registered',
        room_id INTEGER,
        nurse_id INTEGER,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
        FOREIGN KEY (nurse_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS blood_samples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        test_type TEXT CHECK (test_type IN ('blood_count', 'glucose', 'cholesterol', 'calc')),
        status TEXT CHECK(status IN ('collected','cooling','sent')) DEFAULT 'collected',
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      );
    `);

    if (deleteMode) {
      const insertUser = db.prepare(`
        INSERT INTO users (username, password, email, role)
        VALUES (?, ?, ?, ?);
      `);

      insertUser.run('admin', await bcryptPassword("admin"), 'admin@example.com', 'admin');
      insertUser.run('demo', await bcryptPassword("demo"), 'demo@example.com', 'demo');
      insertUser.run('patient', await bcryptPassword("patient"), 'patient@example.com', 'patient');
      insertUser.run('nurse', await bcryptPassword("nurse"), 'nurse@example.com', 'nurse');
      insertUser.run('coordinator', await bcryptPassword("coordinator"), 'coordinator@example.com', 'coordinator');

      const insertRoom = db.prepare(`
        INSERT INTO rooms (name, status) VALUES (?, ?);
      `);

      insertRoom.run('Room 1', 'free');
      insertRoom.run('Room 2', 'free');
      insertRoom.run('Room 3', 'free');

      const patientUser = db.prepare(`
        SELECT id FROM users WHERE role = 'patient' LIMIT 1
      `).get();

      const demoUser = db.prepare(`
        SELECT id FROM users WHERE role = 'demo' LIMIT 1
      `).get();

      const insertPatient = db.prepare(`
        INSERT INTO patients (user_id, cpr_encrypted, status, room_id)
        VALUES (?, ?, ?, ?);
      `);

      const insertExtraPatient = db.prepare(`
        INSERT INTO patients (user_id, cpr_encrypted, status, room_id, last_activity)
        VALUES (?, ?, ?, ?, ?);
      `);

      // Normal patient (won't trigger reset)
      insertPatient.run(
        patientUser.id,
        encryptCPR('120390-1234'),
        'registered',
        null
      );
      let minutes = 5;
      const twoHoursAgo = new Date(Date.now() - ((60+minutes)  * 60 * 1000) )
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      // Extra patient (WILL trigger reset job)
      insertExtraPatient.run(
        demoUser.id,
        encryptCPR('010190-9999'),
        'in_room',
        null,
        twoHoursAgo
      );

      const insertSample = db.prepare(`
        INSERT INTO blood_samples (patient_id, test_type, status)
        VALUES (?, ?, ?);
      `);

      const patients = db.prepare(`
        SELECT id FROM patients
      `).all();

      for (const p of patients) {
        insertSample.run(p.id, 'blood_count', 'collected');
        insertSample.run(p.id, 'glucose', 'cooling');
        insertSample.run(p.id, 'cholesterol', 'sent');
      }
    }
    return db;

  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

await initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully.');

    if (!deleteMode) {
      setInterval(() => {
        resetInactivePatientsJob();
      }, 60 * 1000);
    }
  })
  .catch(err => console.error('Failed to initialize database:', err));

export default db;