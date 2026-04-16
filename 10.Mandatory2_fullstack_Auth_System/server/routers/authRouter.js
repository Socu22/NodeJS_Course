import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../database/db.js';
import { sendSignupEmail } from '../utils/mail.js';

const router = Router();

// AUTH
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).send({ errorMessage: "Not authenticated" });
    }
    next();
};

// ROLE
const authorizeRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.session.user.role)) {
        return res.status(403).send({ errorMessage: "Forbidden" });
    }
    next();
};


// SIGNUP
router.post('/auth/signup', async (req, res) => {
    try {
        const { username, password, email, role } = req.body;

        if (!username || !password || !email) {
            return res.status(400).send({ errorMessage: "Missing fields" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        let tmpRole = role || 'user';

        // Only allow admin creation if requester is admin
        if (req.session?.user?.role === 'admin' && role === 'admin') {
            tmpRole = 'admin';
        } else {
            tmpRole = 'user'; // force fallback
        }

        await db.run(
            "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)",
            [username, hashedPassword, email, tmpRole]
        );

        await sendSignupEmail(email, username);

        res.send({ message: "Signup successful" });

    } catch (error) {
        if (error.message.includes("UNIQUE")) {
            return res.status(400).send({ errorMessage: "User already exists" });
        }

        console.error(error);
        res.status(500).send({ errorMessage: "Server error" });
    }
});


// LOGIN
router.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await db.get(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (!user) {
            return res.status(400).send({ errorMessage: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(400).send({ errorMessage: "Invalid credentials" });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        res.send({
            message: "Login successful",
            data: req.session.user
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ errorMessage: "Server error" });
    }
});


// LOGOUT
router.post('/auth/logout', (req, res) => {
    req.session.destroy(() => res.send({ message: "Logged out" }));
});


// CURRENT USER
router.get('/users/me', isAuthenticated, (req, res) => {
    res.send({ data: req.session.user });
});


// ADMIN ONLY
router.get('/admin', isAuthenticated, authorizeRoles('admin'), (req, res) => {
    res.send({ message: "Admin access granted" });
});

export default router;