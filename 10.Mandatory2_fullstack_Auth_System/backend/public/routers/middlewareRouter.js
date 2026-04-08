import { Router } from 'express';

const router = Router();

function ipLogger(req, res, next) {
    console.log("IP:", req.ip);
    next();
}

// Apply only to specific routes
router.use('/protected', ipLogger);


// Example middleware chain
function logger(req, res, next) {
    console.log("Request received at:", req.path);
    next();
}

function attachFlag(req, res, next) {
    req.customFlag = true;
    next();
}

router.get('/protected/resource', logger, attachFlag, (req, res) => {
    res.send({
        data: "Protected resource accessed",
        flag: req.customFlag
    });
});


// Health check
router.get('/health', (req, res) => {
    res.send({ message: "Server is healthy" });
});

export default router;