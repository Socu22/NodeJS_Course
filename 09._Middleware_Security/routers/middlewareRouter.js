import { Router } from 'express';

const router = Router();


function ipLogger(req, res, next) {
    console.log(req.ip);
    next();
}

router.use('/room', ipLogger);// for only /room, rahter than global for every route endpoint, or something that does not exist 


function butler(req, res, next) {
    console.log('Welcome to the mansion...');
    next();
}

function takeCoat(req, res, next) {
    req.coatOff = true;
    next();
}
// The order matters as it is compiled from top to buttom

router.get('/room/:furniture', butler, takeCoat, (req, res, next) => {// butler is middleware. middleware can be hardware, network, **express**, happens at the smae time as the request 
    // res.send({ data: 'Welcome to room 1' });
    console.log('You are in room 1', req.coatOff);
    next();// goes to next in match in the endpoint.
});

        // inline middleware
router.get('/room', (req, res, next) => {
    console.log("This is the inline middleware");
    next();
}, (req, res) => {
    res.send({ data: 'Welcome to room 2' });
});


export default router;
