const express = require('express')
const app = express()


app.use(express.json())



// new ones 
let movies = [
  {id: 1, title: "deadpool"},
  {id: 2, title: "ironman"},

]
let nextID = 2;  

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
        res.send(foundMovie)
    }
});

// post 
app.post("/movies", (req,res) => {
    const newMovie = {
        id: nextID++,
        title: req.body.title
    }
    movies.push(newMovie)
    console.log(movies);
    res.send({data : newMovie})

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
        res.send(foundMovie);
    }
});


// delete
app.delete("/movies/:id", (req, res) => {
    const providedMoviesId = Number(req.params.id);
    const movieIndex = movies.findIndex( (movie) => movie.id === providedMoviesId);
    if(!movieIndex === -1) {
        res.send({errorMessage: `no movie found by id: ${req.params.id}`} );
    }
    else {
        const deletedMovie = movies.splice(movieIndex, 1)[0];
        res.send(deletedMovie);
    }

});
/*
status codes:
2xx: Succes
3xx: Redirection
4xx: Client error 
5xx: Server error 

*/





app.listen(8080)