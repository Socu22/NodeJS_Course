// const express = require('express');
import express from "express";
const app = express();

app.use(express.static("public"));

import path from "path";

// const commonjsCookiesUtil = require('./util/commonjsCookiesUtil.js');
// console.log(commonjsCookiesUtil.getCookie());

import { esModuleCookieFactory } from "./util/esModuleCookiesUtil.js";
console.log(esModuleCookieFactory());

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/frontpage/frontpage.html"));
});

app.get("/cookieFactory", (req, res) => {
  res.sendFile(path.resolve("public/cookieFactory/cookieFactory.html"));
});

app.get("/redirection", (req, res) => {
  res.sendFile(path.resolve("public/redirection/redirection.html"));
});

app.listen(8080, () => {
  console.log("Server is running on port", 8080);
});
