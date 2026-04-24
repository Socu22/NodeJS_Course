## MySQL      vs.      MongoDB

Databases             Databases
Tables                Collections
Columns               Keys
Cell                  Value


## JSON Schema

MongoDB supports JSON Schema: 

https://www.mongodb.com/resources/languages/json-schema-examples

But not out of the box. The normal case is to have a variable schema.


## Why use MongoDB?

1. Easy conversion from JavaScript objects to documents in MongoDB.
2. Great for rapid prototyping
3. When we have something with a variable schema. When type safety isn't important to us.
4. Frankenstein: Relational for business logic, MongoDB for logging

## How to create relations in MongoDB

1. Create ids manually and manually retrieve multiple times from different collections based on ids.
2. Denormalization 


# Database Statements

## MySQL        vs.        MongoDB

SHOW DATABASES             show dbs
CREATE <database_name>     use <database_name>
USE <database_name>        use <database_name>
CREATE TABLE <table_name>  db.createCollection("<collection_name>")
DROP TABLE <table_name>    db.<collection_name>.drop()
SHOW TABLES                show collections

# CRUD

## MySQL       vs.        MongoDB

INSERT                    insertOne, insertMany, bulkWrite
SELECT                    db.<collection_name>.find({ key: "<search_criteria>" }), findOne
UPDATE                    db.<collection_name>.updateOne({ key: "<search_criteria>" }, { $set: { key: "updatevalue " } }), updateMany, replaceOne, replaceMany
DELETE                    deleteOne, deleteMany

