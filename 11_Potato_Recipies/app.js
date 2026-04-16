import express from 'express';

const app = express();
// make sure validation is at the backend and frontend. if you have to choose then backend. in frontend you could make direct http request with curl or other. you could also use functions directly in terminal(javascript) or change frontend directly in the files(html)
// so make sure t hat the validation happens in the backend, you can supliment it in the frontend.
app.use(express.json());


import recipesRouter from './routers/recipesRouter.js';

app.use(recipesRouter)



const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});