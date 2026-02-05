// hoisting
console.log(getRandomInt(4, 8));

// JavaScript : functions is a first-class citizen
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

// statement requires ;
const getRandomIntAnonymousFunction = function (min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
};

const getRandomIntArrowFunction = (min, max) => {
  return Math.floor(Math.random() * (max + 1 - min) + min);
};

// string, function reference (callback function is a function thats referenced by another as an argument. thats probally will be called back at a later time )
function genericActionPerformer(name, action) {
  return action(name);
}
// task: eat, valdemar
// create a callback function and use the previous generic function to console log what valdemar is eating
function eatingAction(name) {
  return `${name} is eating`;
}
console.log(genericActionPerformer("valdemar", eatingAction));

// task, run, sidi
// declare an anonymous version of sidi is running

const runningAction = (name) => {
  return `${name} is running`;
};
console.log(genericActionPerformer("sidi", runningAction));

// kristian is laughing
// in one line

console.log(
  genericActionPerformer("kristian", (name) => `${name} is laughing`),
);
