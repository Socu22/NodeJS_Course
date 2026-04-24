import {MongoClient} from "mongodb";

const url = "mongodb://localhost:27017";

const client = new MongoClient(url);

const dbName = "fruit_stand"

await client.connect();

const db = client.db(dbName);

const fruits = db.collection('fruits')

export default {
    fruits: db.collection('fruits'),
    stands: db.collection('stands')
}