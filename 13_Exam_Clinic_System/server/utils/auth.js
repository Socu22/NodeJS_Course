
// AUTH
export const isAuthenticated = (req, res, next) => {
    if (!req.session?.user) {
        return res.status(401).send({ errorMessage: "Not authenticated" });
    }
    next();
};

// ROLE
export const authorizeRoles = (...roles) => (req, res, next) => {
    const user = req.session?.user;

    if (!user) {
        return res.status(401).send({ errorMessage: "Not authenticated" });
    }

    if (!roles.includes(user.role)) {
        return res.status(403).send({ errorMessage: "Forbidden" });
    }

    next();
};