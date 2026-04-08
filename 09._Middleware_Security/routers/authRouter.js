import { Router } from 'express';

const router = Router();

/* 
    Auth: Authentication and Authorization

    Authentication: Knowing that the user is who they say they are
    Authorization: Knowing if the user has privileges to access the resources

*/


function isAdmin(req, res, next) {
    // this simulates getting the value from a database
    // and/or comparing tokens / sessions
    const isAdmin = true;
    if (isAdmin) {
        req.user = {
            isAdmin,
            username: 'Bob'
        };
        return next();
    }
    res.status(403).send({ errorMessage: 'You are not an admin' });
}

router.get('/auth/admin', isAdmin, (req, res) => {
    console.log(req.user);
    res.send({ data: 'You are an admin, you can see this: 10 active users' });
});


export default router;
