import { Router } from 'express';

const router = Router();

// Example session usage
router.get('/session/increment', (req, res) => {
    req.session.counter = req.session.counter
        ? req.session.counter + 1
        : 1;

    res.send({ data: `Counter: ${req.session.counter}` });
});

router.get('/session/reset', (req, res) => {
    req.session.counter = 0;
    res.send({ data: "Session counter reset" });
});

router.get('/session/destroy', (req, res) => {
    req.session.destroy(() => {
        res.send({ data: "Session destroyed" });
    });
});

export default router;