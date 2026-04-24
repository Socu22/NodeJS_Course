import db from './connection.js';


// process.argv.find((argument) => argument === '--delete')

const deleteMode = process.argv.includes('--delete');

if (deleteMode) {
    await db.exec(`DROP TABLE IF EXISTS ingredients;`);
    await db.exec(`DROP TABLE IF EXISTS recipes;`);
}



/* Conventions for SQL
    plural for tables
    use lowercase for tables
    use snake case
*/


// DDL
await db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_name VARCHAR(100) NOT NULL,
        description TEXT,
        minutes_to_cook INTEGER
    );
        
    CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER,
        ingredient_name TEXT NOT NULL,
        units INTEGER,
        unit_of_measurement TEXT CHECK( unit_of_measurement IN ('l', 'kg', 'unit') ),
        FOREIGN KEY (recipe_id) REFERENCES recipes (id)
    );
`);


// DML
// seeding
if (deleteMode) {
    await db.prepare(`INSERT INTO recipes (recipe_name) VALUES ('Potato Pancakes');`).run();
    await db.prepare(`INSERT INTO recipes VALUES ('2', 'Baked Potato', 'Also known as a jacket potato. It''s a treat in the winter months.', 12);`).run();
    await db.prepare(`INSERT INTO ingredients (recipe_id, ingredient_name, units, unit_of_measurement) VALUES (1, 'flour', '0.06', 'kg')`).run();
    await db.prepare(`INSERT INTO ingredients (recipe_id, ingredient_name, units, unit_of_measurement) VALUES (2, 'bacon', '1', 'kg')`).run();
}