import db from './connection.js'

const fruit = await db.fruits.find({name: "Apple"}).toArray();

console.log(fruit)
