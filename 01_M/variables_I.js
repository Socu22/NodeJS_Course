// node REPL -->  Read-Eval-Print Loop
//node is a runtime-enviroment. which is the foundation for electron, who makes chatgpt. CLI, Desktop apps. 

// type coercion: javascript won't fail and cause exceptions when trying to add to incompatiable types. 
// It will try hard even if it does not make sense to add things together. 
// As it is made normally for front end we have to make sure type coercion does not happend
    // ==
    // !=
    //+
    //-
// strict equality: is a way to avoid type coercion and check whether something really is equal to another.
    // ===
    //!==


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

// how to define string in js 
// ""
// ''
// ``

const stringTemplateLitteral = `His is it  ${2+2} : ${person.age}
& multi line 
String
    It works 

`
console.log(stringTemplateLitteral);
