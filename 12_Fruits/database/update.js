import db from './connection.js'


const fruitCreated = await db.fruits.updateOne({name: "Orange", price: 5}, {$set: {price:22}});

console.log(fruitCreated)
