// Javascript is single-thread, everything runs in the main thread

// examples of blocking operations
// network, databases, file handling, hardware, user inputs 


// Solution 1: Callback functions

// Problem: Callback hell, Pyramid of doom

// Solution 2: Promises

// pending, fulfilled
            // resolved, rejected

// Problem: Nested promises

// Solution 3: Async / Await (just syntactic sugar, uses promises under the hood)


/* new Promise((resolve, reject) => {
    setTimeout(() => {
        try {
            throw "Oh no!";
            resolve("Everything went well");
        } catch(error) {
            reject(error);
        }
    }, 2000);
})
.then((successMessage) => console.log(successMessage))
.catch((errorMessage) => console.log(errorMessage)); */


/* assignment
Create a promisified function called myPromise
That is a function the returns a promise
Make it resolve as "Something Good" and/or reject as "Something Bad"
Create a 3 second delay to simulate asynchronous behavior
*/
function myPromise() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                throw new Error("Something Bad")
                // resolve("Something Good");
            } catch (error) {
                reject(error);
            }
        }, 3000);
    });
}

// myPromise()
// .then((successMessage) => console.log(successMessage))
// .catch((errorMessage) => console.log(errorMesssage));

/* try {
    const successMessage = await myPromise();
    console.log(successMessage);
} catch (errorMessage) {
    console.log(errorMessage);
}
 */
function myFetch() {
    return new Promise((resolve, reject) => {
        resolve({
            json: () => new Promise((resolve, reject) => resolve({ data: "Data from the server" }))
        })
    });
}

myFetch()
.then((response) => response.json())
.then((result) => console.log(result));


// IIFE
(async() => {
    const response = await myFetch();
    const result = response.json();
    console.log(result);
})();