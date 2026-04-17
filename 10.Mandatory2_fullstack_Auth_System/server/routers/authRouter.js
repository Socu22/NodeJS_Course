import e, { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '../database/db.js';
import { sendSignupEmail, sendForgotPasswordResetTokenEmail } from '../utils/mail.js';

const router = Router();

// AUTH
const isAuthenticated = (req, res, next) => {
    if (!req.session?.user) {
        return res.status(401).send({ errorMessage: "Not authenticated" });
    }
    next();
};

// ROLE
const authorizeRoles = (...roles) => (req, res, next) => {
    const user = req.session?.user;

    if (!user) {
        return res.status(401).send({ errorMessage: "Not authenticated" });
    }

    if (!roles.includes(user.role)) {
        return res.status(403).send({ errorMessage: "Forbidden" });
    }

    next();
};




// ==========================
// PUBLIC SIGNUP
// ==========================
router.post('/auth/signup', async (req, res) => {
    try {
        
        
        const { username, password, email } = req.body;


        if (!username || !password || !email) {
            return res.status(400).send({ errorMessage: "Missing fields" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const role = 'user';  

        await db.run(
            "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)",
            [username, hashedPassword, email, role]
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





// ==========================
// CURRENT USER
// ==========================//

router.get('/users/me', isAuthenticated, (req, res) => {
    res.send({ data: req.session.user });
});

router.put('/users/me', isAuthenticated, async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.session.user.id;

        const existingUser = await db.get(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        if (!existingUser) {
            return res.status(404).send({ errorMessage: "User not found" });
        }

        const updatedUsername = username ?? existingUser.username;
        const updatedEmail = email ?? existingUser.email;

        await db.run(
            `UPDATE users 
             SET username = ?, email = ?
             WHERE id = ?`,
            [updatedUsername, updatedEmail, userId]
        );

        res.send({
            message: "User updated successfully",
            data: {
                id: userId,
                username: updatedUsername,
                email: updatedEmail
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({ errorMessage: "Server error" });
    }
});

// ==========================
// ADMIN: CREATE USER WITH ROLE
// ==========================
router.post(
    '/users',
    isAuthenticated,
    authorizeRoles('admin'),
    async (req, res) => {
        try {
            const { username, password, email, role } = req.body;

            if (!username || !password || !email) {
                return res.status(400).send({ errorMessage: "Missing fields" });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

        
            const finalRole = role ? role : 'user';

            await db.run(
                "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)",
                [username, hashedPassword, email, finalRole]
            );

            await sendSignupEmail(email, username);

            res.send({ message: `User created with role: ${finalRole}` });

        } catch (error) {
            if (error.message.includes("UNIQUE")) {
                return res.status(400).send({ errorMessage: "User already exists" });
            }

            console.error(error);
            res.status(500).send({ errorMessage: "Server error" });
        }
    }
);



// ==========================
// LOGIN
// ==========================
router.post('/auth/login', async (req, res) => {
    try {
        const { username, password, email } = req.body;

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
            email: user.email,
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

// ==========================
// FORGOT PASSWORD & RESET PASSWORD
// ==========================
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};
router.post('/auth/forgotpassword', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).send({ errorMessage: "Email required" });
        }

        const user = await db.get(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        // Always return same response (security)
        if (!user) {
            return res.send({ message: "If email exists, reset link sent" });
        }

        // Generate secure token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = hashToken(rawToken);

        const expiry = Date.now() + 1000 * 60 * 2; // 2 min

        await db.run(
            `UPDATE users 
             SET reset_token = ?, reset_token_expiry = ? 
             WHERE id = ?`,
            [hashedToken, expiry, user.id]
        );

        await sendForgotPasswordResetTokenEmail(
            email,
            user.username,
            rawToken+""
        );

        res.send({ message: "If email exists, token has been sent" });

    } catch (err) {
        console.error(err);
        res.status(500).send({ errorMessage: "Server error" });
    }
});

router.post('/auth/resetpassword', async (req, res) => {
    try {
        const { newPassword, token } = req.body;
        console.log(req.body);
        

        if (!token || !newPassword) {
            return res.status(400).send({ errorMessage: "Missing fields" });
        }

        const hashedToken = hashToken(token);

        const user = await db.get(
            "SELECT * FROM users WHERE reset_token = ?",
            [hashedToken]
        );

        if (!user) {
            return res.status(400).send({ errorMessage: "Invalid token" });
        }

        if (user.reset_token_expiry < Date.now()) {
            return res.status(400).send({ errorMessage: "Token expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        console.log(newPassword);
        

        await db.run(
            `UPDATE users 
             SET password = ?, reset_token = NULL, reset_token_expiry = NULL
             WHERE id = ?`,
            [hashedPassword, user.id]
        );

        res.send({ message: "Password updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).send({ errorMessage: "Server error" });
    }
});



// ==========================
// LOGOUT
// ==========================
router.post('/auth/logout', (req, res) => {
    req.session.destroy(() => res.send({ message: "Logged out" }));
});





// ==========================
// ADMIN TEST
// ==========================
router.get(
    '/admin',
    isAuthenticated,
    authorizeRoles('admin'),
    (req, res) => {
        res.send({ message: "Admin access granted" });
    }
);

export default router;