import { Router } from 'express';

const router = Router();

router.get('/dogpark/bark', (req, res) => {

    req.session.dogBarks = req.session.dogBarks ? req.session.dogBarks + 1 : 1;

    res.send({ data: `A dog barked. Total barks ${req.session.dogBarks}` });
});


router.get('/dogpark/shutup', (req, res) => {
    const dogBarks = req.session.dogBarks;
    req.session.dogBarks = 0;

    res.send({ data: `No more dogs barking. Amount of dogs being quited ${dogBarks}.` });
});

router.get('/dogpark/shutdown', (req, res) => {
    // req.session.dogBarks = undefined;
    req.session.destroy((error) => {
        res.send({ data: "The park has been shut down" });
    });
});


export default router;
