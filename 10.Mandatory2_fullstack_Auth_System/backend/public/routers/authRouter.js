import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../database/db.js';
import { sendSignupEmail } from '../../utils/mail.js';

const router = Router();

/*
Authentication = login/signup
Authorization = access control via session
*/


// 🔒 AUTH MIDDLEWARE
function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.status(401).send({ errorMessage: "Not authenticated" });
    }
    next();
}


// 📝 SIGNUP
router.post('/auth/signup', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).send({ errorMessage: "Missing fields" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        db.run(
            "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
            [username, hashedPassword, email],
            async function (error) {
                if (error) {
                    return res.status(400).send({ errorMessage: "User already exists" });
                }

                // 📧 SEND EMAIL
                await sendSignupEmail(email, username);

                return res.send({ message: "Signup successful (email sent)" });
            }
        );

    } catch (err) {
        res.status(500).send({ errorMessage: "Server error" });
    }
});


// 🔑 LOGIN
router.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], async (error, user) => {

        if (error || !user) {
            return res.status(400).send({ errorMessage: "Invalid credentials" });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(400).send({ errorMessage: "Invalid credentials" });
        }

        // SESSION
        req.session.user = {
            id: user.id,
            username: user.username
        };

        return res.send({
            message: "Login successful",
            data: req.session.user
        });
    });
});


// 🚪 LOGOUT
router.post('/auth/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).send({ errorMessage: "Logout failed" });
        }

        res.send({ message: "Logged out" });
    });
});


// 👤 CURRENT USER (PROTECTED)
router.get('/auth/me', isAuthenticated, (req, res) => {
    res.send({ data: req.session.user });
});


// 🔐 ADMIN AUTHORIZATION
function isAdmin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).send({ errorMessage: "Not logged in" });
    }

    if (req.session.user.username !== "admin") {
        return res.status(403).send({ errorMessage: "Not admin" });
    }

    next();
}

router.get('/auth/admin', isAdmin, (req, res) => {
    res.send({ data: "Admin access granted" });
});

export default router;