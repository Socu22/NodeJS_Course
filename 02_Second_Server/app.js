const express = require("express"); 
const app = express();
console.log(express());

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get("/_movies",(req,res)=>{
    const movies = ["deadpool","spiderman 1", "spiderman 2", "spiderman 3", "ironman", "thor", "captain america"];
    res.send({data : movies})


})













app.listen(8080)