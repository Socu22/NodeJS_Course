import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('node-potato-recipes.db');

export default db;