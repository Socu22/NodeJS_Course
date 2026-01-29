// node REPL -->  Read-Eval-Print Loop
//node is a runtime-enviroment. which is the foundation for electron, who makes chatgpt. CLI, Desktop apps. 

// type coercion 
// strict equality


// Rules
// Rule 1: Use const per default, unless it needs to change, then use let.  
// const is constant in the assignment, but not in the value. as in no matter what value it has it is assigned 
    // Rule 1.1: all files are modules. when running in terminal be at the path of the refered file.    
    //node XX.js  / node path 00_?/file.js


const luckyNumber = 4;  // variable assigner: const
console.log(luckyNumber);

// JS Data Types 
    //String, Number, Boolean, BigInt ,Object(Object ,arrays === type of object)        
    //Symbol, null, undefined 
const person= {
    // Key-value pair 
    name: "bob"
};
person.name="jens";
person.age= "234";
console.log(person);

const people = [];
people.push("Victor");
console.log(people);

// ASI, Automatic semi-colon insertion 