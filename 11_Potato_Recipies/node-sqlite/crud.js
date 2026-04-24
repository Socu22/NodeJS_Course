// This is a replica of what the queries in the recipesRouter.js file

//     const recipes = await db.all('SELECT * FROM recipes;');

import db from './connection.js';

const allRecipes = await db.prepare('SELECT * FROM recipes;').all();

console.log(allRecipes);

const recipeName = 'Potato Salad';
const description = 'Worthy of a major festival celebration.';
const minutesToCook = 20;



const createdRecipe = await db.prepare(`
        INSERT INTO recipes
        (recipe_name, description, minutes_to_cook)
        VALUES (?, ?, ?);
`).run(recipeName, description, minutesToCook);

console.log(createdRecipe);