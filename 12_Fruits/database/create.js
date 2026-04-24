import db from './connection.js'


const fruitCreated = await db.fruits.insertOne({name: "Orange", price: 5});

console.log(fruitCreated)
