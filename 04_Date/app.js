const express = require('express');

const app = express(); 



/*
console.log(new Date()); // UTC Date + Time  
console.log(Date()); // Local Time 
console.log(Date.now()); // Unix Epoch Time (Miliseconds since Jan. 1st 1970)
*/

// array of months is saved for later. 
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = [
    "Sunday",
    "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

app.get("/months/v1", (req,res) => {
    const currentMonth = new Date().getMonth();
    
    res.send({data: months[currentMonth]})
    


});

app.get("/months/v2", (req,res) => {
    const currentMonth = new Date().toLocaleDateString('default', {month: 'long'})
    //const currentMonth = new Date().toLocaleDateString('en-uk', {month: 'short'})
    console.log(currentMonth);
    
    res.send({data: currentMonth})
    


});
app.get("/days/v1", (req,res) => {
    const currentDay = new Date().getDay(); // this is an english week. Sunday is the first day of the week

    res.send({data: days[currentDay]});

});

app.get("/days/v2", (req,res) => {
    const currentDay = new Date().toLocaleDateString("en-uk", {weekday: "long"}); 
    res.send({data: currentDay});

});
/*
console.log(new Date().getMonth())
console.log(Date().split(" ")[1]);


console.log(new Date().getDate())
console.log(Date().split(" ")[0]);
*/







// falsy values : false, null, undefined, NaN, "", 

app.listen(8080, (error) => {


    if(error) { // this will activate if there is anything there is not falsy values
        console.log("error");
        
        return;

    }

    console.log("Server is running on port",8080);
    
})