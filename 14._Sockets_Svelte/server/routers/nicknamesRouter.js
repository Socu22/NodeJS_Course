import { log } from "console";
import { Router } from "express";

const router = Router();

router.get("/nicknames", (req,res)=> {
    res.send({data: req.session.nickname})
});


router.post("/nicknames", (req,res)=> {
    req.session.nickname= req.body.nickname;
    
    res.send({data: req.session.nickname})
});


export default router;