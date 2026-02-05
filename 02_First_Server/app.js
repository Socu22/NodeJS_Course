// Remember this has to be named app.js as it is refered with the same name in the dependency express package. it is easier for it to remain the same name. 
// import express
const express = require("express");
// instantiate express
const app = express();

//one-liner version
//const app = require("express")();

// as a Client you request then the server sends a Response. we are the server, this means we can give a response without recieving a request.
app.get("/", (req,res)=>{
    res.send({data: "welcome to this server!"});
    
});


// /snowstorms repsond with warning
app.get("/snowstorms",(req,res)=>{
    res.send({data : "Warning"});
});
  

// how to send data through a get request. with a (query string / query parameters )
app.get("/cars/:carModel/:year",(req,res)=>{
    console.log(req.params)
    res.send({data : `Your ${req.params.carModel} is very nice & its from year ${req.params.year}!`}); 

})

// 
app.get("/bag",(req,res)=>{
    res.send({data : req.query})
})




//always at the buttom!!
app.listen(8080);