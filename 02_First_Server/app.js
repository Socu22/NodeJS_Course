// Remember this has to be named app.js as it is refered with the same name in the dependency express package. it is easier for it to remain the same name. 
// import express
const express = require("express");
// instantiate express
const app = express();

app.use(express.json() ); // if a json body is undefined you have to use this body parser of the express dependency 

//one-liner version
//const app = require("express")();

//console.log(__dirname) this gives your current path
// as a Client you request then the server sends a Response. we are the server, this means we can give a response without recieving a request.
app.get("/", (req,res)=>{
    res.sendFile(__dirname+'/index.html'); // Path must be absolute 
    
});
app.get("/xss", (req,res)=>{
    res.sendFile(__dirname+'/xss.html'); // Path must be absolute 
    
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
    res.send({data : req.query});
})

// proxy. client request from server who send a request to another server who then sends a respose to the client 
app.get("/proxy", (req,res) => {
    /*
    fetch('https://www.google.com/').then((response) => response.text()).then((result) => {
        console.log(result)
        res.send(result)

    })
        */
    //use Text encoder. check parrent code. problems: encoder, static files images. 
    // insert a better solution from teacher  repo 
     fetch("https://www.google.com/")
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
        const decoder = new TextDecoder("ISO-8859-1");
        const text = decoder.decode(buffer);
        res.send(text);
    });
})

app.post("/dinosaurs", (req,res) => {
    console.log(req.body);
    res.send(req.body)
    
}) 

let energidrinks = []
// post route to /energidrinks
app.post("/energidrinks", (req,res) => {
   // console.log(req.body);
    energidrinks.push(req.body)
    console.log(energidrinks);
    res.send({data : req.body})
})



//always at the buttom!!
app.listen(8080);