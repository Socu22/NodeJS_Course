import db from './connection.js'

//console.log(process.argv.find((argument)=> argument === '---delete')); // finds an array of argv to find --delete
console.log(process.argv.includes('--delete'));

const deleteMode = process.argv.includes('--delete')

if(deleteMode){
    await db.exec('DROP TABLE IF EXISTS ingredients;');
    await db.exec('DROP TABLE IF EXISTS recipes;');

}
/*
 .exec() // RUn DCL / DDL (with no parameters) , drop, create  DDL
 .run()  // Run a query without returning data, Insert,Update,Delete   DML
 .all() // Run a query and retrieve the result set, Select   

*/
/* Conventions for SQL 
    SELECT * FROM games WHERE title = 1; // not required, but is done.
    use snake case  ( user_account instead of userAccount or user-account)
    plural for tables (accounts)
    use lowercase for tables (not ACCOUNTS)
*/

// DDL (data defination launguage )
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
        unit_of_measurement TEXT CHECK(unit_of_measurement IN ("l","kg","unit") ),
        FOREIGN KEY (recipe_id) REFERENCES recipes (id)
    );
`);
// winget install SQLite.SQLite. .exit .tables
// DML (data mainipulation language )
// seeding 
if (deleteMode){
    await db.run(`
    INSERT INTO recipes (recipe_name) VALUES ('Potato pancakes');
    `);

    await db.run(`
        INSERT INTO recipes VALUES ('2','Baked Potato', 'Also known as a jacket potato. Its a treat in the winter months. It was my grandmothers recipe.',12);
        `);
    await db.run(`
        INSERT INTO ingredients (recipe_id, ingredient_name, units, unit_of_measurement) VALUES (1,'flour','0.06','kg');
    `)
    await db.run(`
        INSERT INTO ingredients (recipe_id, ingredient_name, units, unit_of_measurement) VALUES (1,'bacon','1','kg');
    `)
}
