const express = require('express')
const app = express()


app.use(express.json())



// new ones 
let movies = [
  {id: 1, title: "deadpool"},
  {id: 2, title: "ironman"},

]
let nextID = 3;  
let currentId= 2;
app.get("/movies",(req,res) => {
    console.log(movies);
    res.send({data: movies});
})

app.get("/movies/:id", (req,res) => {
    const providedMoviesId = Number(req.params.id);
    const foundMovie = movies.find((movie) => movie.id === providedMoviesId)
    if(!foundMovie){
        res.send({errorMessage: `no movie found by id: ${req.params.id}`}) // dont have an res with no return that can go to one with res
    }
    else {
        res.send({data: foundMovie});
    }
});

//undefined.id = 5

// post 
app.post("/movies", (req,res) => {
    //const newMovie = {        id: nextID++,        title: req.body.title    }
    //movies.push(newMovie);
    //console.log(movies);
    //res.send({data : newMovie});
    if (!req.body){
        return res.status(400).send({errorMessage: 'No Json body provided.'})
    }
    const providedMovie = req.body;
    //providedMovie.id =  currentId++; // increments after it should be used. Prefix notation. 
    //providedMovie.id =  ++currentId;
    providedMovie.id = nextID++;
++
    movies.push(providedMovie);
    res.send({data: providedMovie})



});

// put
app.put("/movies/:id", (req, res) => {
    const providedMoviesId = Number(req.params.id);
    const foundMovie = movies.find(
        (movie) => movie.id === providedMoviesId
    );

    if (!foundMovie) {
        res.send({ errorMessage: `no movie found by id: ${req.params.id}` });
    } else {
        foundMovie.title = req.body.title;
        res.send({data: foundMovie});
    }
});

// patch. Many places are not supported. therefore most use put to delete the whole thing and replace it with body of request.
app.patch("/movies/:id", (req,res) => {
    const providedMovieId = Number(req.params.id);
    const foundMovieIndex = movies.findIndex( (movie) => movie.id === providedMovieId);  


    if (!foundMovie) {
        return res.status(404).send({ errorMessage: `no movie found by id: ${req.params.id}` });
    } 
    const foundMovie = movies[foundMovieIndex]
    const providedMovie = req.body;

    const movieToCreate = {...foundMovie, ...providedMovie, id: providedMovieId}; // provided movie will overwrite attributes key value pairs to the last mentioned one. you could overwrite id so you will make the last mention of the id to what i originaly was. Spread operator ...

    movies[foundMovieIndex] = movieToCreate;

    res.send({data: movieToCreate})

})

// delete
app.delete("/movies/:id", (req, res) => {
    const providedMoviesId = Number(req.params.id);
    const foundMovieIndex = movies.findIndex( (movie) => movie.id === providedMoviesId); // returns -1 if it does not exist 
    if(!foundMovieIndex === -1) {
        return  res.status(404).send({errorMessage: `no movie found by id: ${req.params.id}`})
    }
    
    movies.splice(foundMovieIndex,1)
    res.status(204).send();
    

});
/*
status codes:
2xx: Succes
3xx: Redirection 
4xx: Client error 
5xx: Server error 

*/





app.listen(8080)