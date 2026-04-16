import { Router } from "express";
import db from '../database/connection.js'

const router = Router();


router.get("/recipes", async (req,res) => {
    const recipes = await db.all('SELECT * FROM recipes');

    res.send({data: recipes})

});

router.post('recipes2', async (req,res)=> {
    const {recipeName,description,minutesToCook} = req.body;
    // cammel case 
    // sql injection unsafe, as or 1=1; SELECT * FROM users can be inserted 
    //const result = await db.run(` 
      //  INSERT INTO recipes
       // (recipe_name,description,minutes_to_cook) 
       // VALUES('${recipeName}','${description}','${minutesToCook}')
        //`);
    const result = await db.run(` 
        INSERT INTO recipes
        (recipe_name,description,minutes_to_cook) 
        VALUES(?,?,?)
       `,[recipeName,description,minutesToCook]);
    res.send({data: {id : lastID}});

})


router.post('/recipes', async (req, res) => {

    const { recipeName, description, minutesToCook } = req.body;

    const result = await db.run(`
        INSERT INTO recipes 
        (recipe_name, description, minutes_to_cook)
        VALUES (?, ?, ?);
    `, [recipeName, description, minutesToCook]);

    // Beware of SQL Injection. Use prepared statements!!!
    // ' OR 1 = 1; SELECT * FROM users;'

    res.send({ data: { id: result.lastID } });
});

export default router;