import { Router } from "express";

import { frontpagePage, aboutPage } from "../util/pagesUtil.js";

const router = Router();

router.get("/", (req, res) => {
  res.send(frontpagePage);
});

router.get("/about", (req, res) => {
  res.send(aboutPage);
});

router.post('/api/about', (req, res) => { // this is for tesing the form in about.html 
    console.log(req.body);
    res.send({ data: req.body }); // 
});


// assignment set up a router here and include it in app.js
export default router;
