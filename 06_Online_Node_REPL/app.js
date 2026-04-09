import express from "express";
import path from "path";

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // this is used for express forms to exucute post a method 

// ===================== Pages ==============================

// INSERTT TEMPLEATES INTO COMPONEMTNS
// SEO vs ssr XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

import pagesRouter from "./routers/pagesRouter.js";

app.use(pagesRouter);

// ===================== API ==============================

import replRouter from "./routers/replRouter.js"; // imports are not locked to only be at the top of the .js
import { log } from "console";

app.use(replRouter); // when using

//console.log(process.env.PORT); // PORT=9090 node app.js  ? $env:PORT=9090 node app.js? find this
// use cross-env instead as a wrapper. as port assgiemnt works different in different terminals

// short-circuit syntax
const PORT = process.env.PORT || 8080; // This instead of config inline.
const server = app.listen(PORT, () => {
  // app.listen send something back at once to server
  //console.log("Server started on port", server.address().port);
  console.log("Server started on port", server.address().port); // which is used here to make it work. port is part of the adress() to get the port.
});
