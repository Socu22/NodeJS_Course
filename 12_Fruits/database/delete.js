import db from './connection.js'


const fruitCreated = await db.fruits.deleteOne({name: "Orange", price: 22});

console.log(fruitCreated)
