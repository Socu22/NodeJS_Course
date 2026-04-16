// sqllite driver. for sqlite3. cannot contain many concurrent connections. Is faster than ? when using textfile databases. 

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const connection = await open({ // makes a connection 
    filename: 'recipes.db', // this is not a convention but it is done often.
    driver: sqlite3.Database // driver allow comunication for the .db file
}); 

export default connection; 