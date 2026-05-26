import e, { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto, { randomBytes } from 'crypto';
import db from '../database/db.js';
import { sendSignupEmail, sendForgotPasswordResetTokenEmail } from '../utils/mail.js';
import { encryptCPR,decryptCPR } from '../utils/encryption.js';
import { isAuthenticated, authorizeRoles } from '../utils/auth.js';
import { updatePatientActivity } from '../jobs/patientsJob.js';

const router = Router();

/*
This API follows a hybrid architecture:
 *
 * 1. AUTHENTICATION (/auth/*)
 *    - Handles login, signup, logout
 *    - Handles password recovery flow
 *    - Establishes and destroys session state
 *
 * 2. USER RESOURCE (/users/*)
 *    - Represents user data as a RESTful resource
 *    - "me" endpoints operate on the currently authenticated user
 *    - No user ID is trusted from the client for self-actions
 *
 * 3. ADMIN OPERATIONS (/users, /admin/*)
 *    - Restricted to users with role: "admin"
 *    - Allows creation of users with explicit roles
 *    - Enforced via authorizeRoles middleware
*/



// ==========================
// SIGNUP if patient 
// ==========================
function createPatient(userId, cpr) {
  const encryptedCPR = encryptCPR(cpr);

  return db.prepare(`
    INSERT INTO patients (user_id, cpr_encrypted, room_id)
    VALUES (?, ?, NULL)
  `).run(userId, encryptedCPR);
}

// ==========================
// PUBLIC SIGNUP
// ==========================
router.post('/auth/signup', async (req, res) => {
  try {
    const { username, password, email, cpr } = req.body;

    if (!username || !password || !email || !cpr) {
      return res.status(400).send({
        errorMessage: 'Missing fields'
      });
    }
    if (String(cpr).length !== 10) {
      return res.status(400).send({
       errorMessage: 'CPR must be 10 digits'
    });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const role = 'patient';

    db.exec('BEGIN IMMEDIATE');

    const userResult = db.prepare(`
      INSERT INTO users (username, password, email, role)
      VALUES (?, ?, ?, ?)
    `).run(username, hashedPassword, email, role);

    const userId = userResult.lastInsertRowid;

    createPatient(userId, cpr);

    db.exec('COMMIT');

    await sendSignupEmail(email, username);

    return res.send({
      successMessage: 'Signup successful'
    });

  } catch (error) {
    try {
      db.exec('ROLLBACK');
    } catch {}

    if (error.message.includes('UNIQUE')) {
      return res.status(400).send({
        errorMessage: 'User or CPR already exists'
      });
    }

    console.error(error);

    return res.status(500).send({
      errorMessage: 'Server error'
    });
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

        const existingUser = db.prepare(
            "SELECT * FROM users WHERE id = ?")
            .get(userId);

        if (!existingUser) {
            return res.status(404).send({ errorMessage: "User not found" });
        }

        const updatedUsername = username ?? existingUser.username;
        const updatedEmail = email ?? existingUser.email;

        db.prepare(
            `UPDATE users 
             SET username = ?, email = ?
             WHERE id = ?`)
             .run(updatedUsername, updatedEmail, userId);

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
router.get('/patients/me', isAuthenticated, authorizeRoles('patient'), (req, res) => {
    try {
        const userId = req.session.user.id;

        const patient = db.prepare(`
            SELECT 
                p.*, 
                r.name AS roomName
            FROM patients p
            LEFT JOIN rooms r ON p.room_id = r.id
            WHERE p.user_id = ?
        `).get(userId);

        if (!patient) {
            return res.status(404).send({
                errorMessage: "Patient not found"
            });
        }

        patient.cpr = decryptCPR(patient.cpr_encrypted);
        delete patient.cpr_encrypted;

        res.send({ data: patient });

    } catch (err) {
        console.error(err);
        res.status(500).send({
            errorMessage: "Server error"
        });
    }
});
router.patch(
  '/patients/activity',
  isAuthenticated,
  authorizeRoles('patient'),
  (req, res) => {
    try {
      const userId = req.session.user.id;

      db.prepare(`
        UPDATE patients
        SET last_activity = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(userId);

      return res.send({
        successMessage: 'Patient activity updated'
      });

    } catch (err) {
      console.error(err);

      return res.status(500).send({
        errorMessage: 'Failed to update patient activity'
      });
    }
  }
);
router.get(
  '/blood-samples/me',
  isAuthenticated,
  authorizeRoles('patient'),
  (req, res) => {
    try {
      const user = req.session.user;

      if (!user?.id) {
        return res.status(401).send({
          errorMessage: 'Not authenticated'
        });
      }

      const patient = db.prepare(`
        SELECT id
        FROM patients
        WHERE user_id = ?
      `).get(user.id);

      if (!patient) {
        return res.status(404).send({
          errorMessage: 'Patient not found for this user'
        });
      }

      const samples = db.prepare(`
        SELECT *
        FROM blood_samples
        WHERE patient_id = ?
      `).all(patient.id);

      return res.send({
        data: samples
      });

    } catch (error) {
      console.error(error);

      return res.status(500).send({
        errorMessage: 'Server error'
      });
    }
  }
);

// ==========================
// ADMIN: CREATE USER WITH ROLE
// ==========================
router.post(
    '/users',
    isAuthenticated,
    authorizeRoles('admin'),
    async (req, res) => {
        try {
            const { username, password, email, role, cpr } = req.body;

            if (!username || !password || !email) {
                return res.status(400).send({
                    errorMessage: "Missing fields"
                });
            }

            if (cpr && String(cpr).length !== 10) {
                return res.status(400).send({
                    errorMessage: "CPR must be 10 digits"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const finalRole = role || 'user';

            db.exec('BEGIN IMMEDIATE');

            const result = db.prepare(`
                INSERT INTO users (username, password, email, role)
                VALUES (?, ?, ?, ?)
            `).run(username, hashedPassword, email, finalRole);

            const userId = result.lastInsertRowid;


            if (cpr) {
                createPatient(userId, cpr);
            }

            db.exec('COMMIT');

            await sendSignupEmail(email, username);

            return res.send({
                successMessage: cpr
                    ? `User created with role: ${finalRole} and patient created`
                    : `User created with role: ${finalRole}`
            });

        } catch (error) {
            try {
                db.exec('ROLLBACK');
            } catch {}

            if (error.message.includes("UNIQUE")) {
                return res.status(400).send({
                    errorMessage: "User or CPR already exists"
                });
            }

            console.error(error);

            return res.status(500).send({
                errorMessage: "Server error"
            });
        }
    }
);


// ==========================
// LOGIN
// ==========================
router.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = db.prepare(
            "SELECT * FROM users WHERE username = ?"
        ).get(username);

        if (!user) {
            return res.status(400).send({ errorMessage: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(400).send({ errorMessage: "Invalid credentials" });
        }

       if (user.role === 'patient'){
            db.prepare(`
                UPDATE patients
                SET status = 'waiting'
                WHERE user_id = ?
                AND status ='registered'`).run(user.id);
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

        const user = db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).get(email);

        // Always return same response (security)
        if (!user) {
            return res.send({ message: "If email exists, reset link sent" });
        }

        // Generate secure token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = hashToken(rawToken);

        const expiry = Date.now() + 1000 * 60 * 2; // 2 min

        db.prepare(
            `UPDATE users 
             SET reset_token = ?, reset_token_expiry = ? 
             WHERE id = ?`
        ).run(hashedToken, expiry, user.id);

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

        if (!token || !newPassword) {
            return res.status(400).send({ errorMessage: "Missing fields" });
        }

        const hashedToken = hashToken(token);

        const user = db.prepare(
            "SELECT * FROM users WHERE reset_token = ?"
        ).get(hashedToken);

        if (!user) {
            return res.status(400).send({ errorMessage: "Invalid token" });
        }

        if (user.reset_token_expiry < Date.now()) {
            return res.status(400).send({ errorMessage: "Token expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);        

        db.prepare(
            `UPDATE users 
             SET password = ?, reset_token = NULL, reset_token_expiry = NULL
             WHERE id = ?`
        ).run(hashedPassword, user.id);

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
  try {
    const user = req.session.user;

    if (user?.role === 'patient') {
      db.prepare(`
        UPDATE patients
        SET
          status = 'registered',
          room_id = NULL,
          nurse_id = NULL
        WHERE user_id = ?
        AND status IN ('waiting', 'registered', 'in_room')
      `).run(user.id);
    }

    req.session.destroy(() => {
      res.send({ message: 'Logged out' });
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      errorMessage: 'Logout failed'
    });
  }
});





// ==========================
// CPR DECRYPTION TEST
// ==========================
router.get('/test', (req, res) => {
  try {
    const patient = db.prepare(`
      SELECT cpr_encrypted FROM patients WHERE user_id = ?
    `).get(3);

    if (!patient) {
      return res.status(404).send({ error: 'Patient not found' });
    }

    const cpr = decryptCPR(patient.cpr_encrypted);

    return res.send({ data: cpr });

  } catch (err) {
    return res.status(500).send({ error: 'Failed to decrypt CPR' });
  }
});
export default router;