import bcrypt from "bcrypt";
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('clinicDatabase.db');

const deleteMode = process.argv.includes("--delete");

function bcryptPassword(password) {
  return bcrypt.hash(password, 12);
}

async function initializeDatabase() {
  try {
    if (deleteMode) {
      db.exec('DROP TABLE IF EXISTS users;');
      console.log('Users table dropped.');
    }

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
    console.log('Users table created or already exists.');

    if (deleteMode) {
      const insertUser = db.prepare(`
        INSERT INTO users (username, password, email, role)
        VALUES (?, ?, ?, ?);
      `);

      insertUser.run(
        'admin',
        await bcryptPassword("admin"),
        'admin@example.com',
        'admin'
      );

      insertUser.run(
        'demo',
        await bcryptPassword("demo"),
        'demo@example.com',
        'demo'
      );
      insertUser.run(
        'patient',
        await bcryptPassword("patient"),
        'patient@example.com',
        'patient'
      );
      insertUser.run(
        'nurse',
        await bcryptPassword("nurse"),
        'nurse@example.com',
        'nurse'
      );
      insertUser.run(
        'coordinator',
        await bcryptPassword("coordinator"),
        'coordinator@example.com',
        'coordinator'
      );

      console.log('Users table seeded with sample data.');
    }

    return db;
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

await initializeDatabase()
  .then(() => console.log('Database initialized successfully.'))
  .catch(err => console.error('Failed to initialize database:', err));

export default db;