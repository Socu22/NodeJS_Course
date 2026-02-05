//"use strict";

// missing declaration
// never do this
totalNumberVariable = "";

var globalVariable = "This is defined in global scope";
let boundVariable = "this is defined in the bound scope";

// const public = "this variable is named public";
let x = true;
{
  // block scope
  let y = false;
}
console.log(y);

for (var i = 0; i <= 5; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}
for (let i = 0; i <= 5; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}
