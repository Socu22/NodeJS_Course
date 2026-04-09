import { Router } from 'express';

const router = Router();

router.get('/api/visitors', (req, res) => {
    res.send({ data: req.session.visitorsCount || 0 });
});

router.post('/api/visitors', (req, res) => {
    req.session.visitorsCount = !req.session.visitorsCount ? 1 : req.session.visitorsCount + 1;
    res.send({ data: req.session.visitorsCount });
});


export default router;
