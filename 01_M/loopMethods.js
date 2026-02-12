// .map .forEach .filter .reduce .sort .find .indexOf
// you use these methods to make the code more functionel 

// rule 1 :  Use loop methods whenever possible 
// rule 2 : Only use for loops in JavaScript for finger counting. Only when you have to count.
// rule 3 : Use map over forEach if you need the data afterwerwards 

const numbers = [1,2,3,4,5]

// maps 1:1 to a new array
const doubleNumbers = numbers.map((number) => {  // avoid side effects that affect the numbers array rather than reading & inserting it correctly inside anatoher const which represents what you are looking for  
    return number * 2; 
});

console.log((doubleNumbers));

const ballonAnimals = [
    {type:"koala", difficulty: 5.0}, // objects can have an side effect in a latter .map as the objects are only refrenced to be in a array.
    {type:"dog", difficulty: 3.0},
    {type:"cat", difficulty: 2.0, isSmall: true}
]

const difficultyUpdatedBallonAnimals = ballonAnimals.map((ballonAnimal) => {
    if(ballonAnimal.type !== "koala" ) {
        ballonAnimal.difficulty= 3.0; // here side effects happend even when using a map.
    }
    return ballonAnimal;
});

console.log(ballonAnimals);
console.log(difficultyUpdatedBallonAnimals);


// ternary statement 
// condition ? if true : if false 
const difficultyUpdatedBallonAnimalsOneLiner = ballonAnimals.map((ballonAnimal)  => ({
    difficulty: ballonAnimal.type !== "koala" ? 3.0 : ballonAnimal.difficulty,
    ...ballonAnimal // takes key value pairs inside an object, takes the value and spreads it out. ??
}) )
console.log(difficultyUpdatedBallonAnimalsOneLiner)

numbers.map((element,index, origrinalArray) => console.log(element,index,origrinalArray))


