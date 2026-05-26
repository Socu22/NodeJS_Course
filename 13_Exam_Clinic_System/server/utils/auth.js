
// AUTH
export const isAuthenticated = (req, res, next) => {
    if (!req.session?.user) { // midddleware that makes sure that it is a session user who access the API-endpoints
        return res.status(401).send({ errorMessage: "Not authenticated" });
    }
    next();
};

// ROLE
export const authorizeRoles = (...roles) => (req, res, next) => {
    const user = req.session?.user;

    if (!user) { //makes sure that it is a session user who access the API-endpoints
        return res.status(401).send({ errorMessage: "Not authenticated" });
    }

    if (!roles.includes(user.role)) { // with the right roles
        return res.status(403).send({ errorMessage: "Forbidden" });
    }

    next();
};