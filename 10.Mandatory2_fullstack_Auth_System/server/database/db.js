import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open the database connection
const db = await open({
  filename: './database.db',
  driver: sqlite3.Database
});

// Check for --delete flag
const deleteMode = true

async function initializeDatabase() {
  try {
    // Drop users table if --delete flag is present
    if (deleteMode) {
      await db.exec('DROP TABLE IF EXISTS users;');
      console.log('Users table dropped.');
    }

    // Create users table (DDL)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT,
        role TEXT DEFAULT 'user'
      );
    `);
    console.log('Users table created or already exists.');

    // Seed data if --delete flag is present (DML)
    if (deleteMode) {
      // Insert sample users with hashed passwords
      await db.run(`
        INSERT INTO users (username, password, email, role)
        VALUES ('admin', '$2b$10$somehashedpassword', 'admin@example.com', 'admin');
      `);

      await db.run(`
        INSERT INTO users (username, password, email)
        VALUES ('john_doe', '$2b$10$anotherhashedpassword', 'john@example.com');
      `);

      await db.run(`
        INSERT INTO users (username, password, email)
        VALUES ('jane_doe', '$2b$10$yethashedpassword', 'jane@example.com');
      `);

      console.log('Users table seeded with sample data.');
    }

    return db;
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

// Initialize the database
await initializeDatabase()
  .then(() => console.log('Database initialized successfully.'))
  .catch(err => console.error('Failed to initialize database:', err));

// Export the database connection
export default db;