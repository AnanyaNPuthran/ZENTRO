// ─── Zentro Auth Routes ─────────────────────────────

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const {
    sendLoginNotification
} = require('../utils/mailer');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'zentro_default_jwt_secret_change_in_production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '30d';

// ─── NeDB Helper Functions ──────────────────────────

const findOne = (query) =>
    new Promise((resolve, reject) => {
        db.findOne(query, (err, doc) =>
            err ? reject(err) : resolve(doc)
        );
    });

const insert = (doc) =>
    new Promise((resolve, reject) => {
        db.insert(doc, (err, doc) =>
            err ? reject(err) : resolve(doc)
        );
    });

const update = (query, upd) =>
    new Promise((resolve, reject) => {
        db.update(query, upd, {}, (err, count) =>
            err ? reject(err) : resolve(count)
        );
    });

// ─── Authentication Middleware ─────────────────────

function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Not authenticated.'
        });
    }

    try {
        req.user = jwt.verify(header.slice(7), JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({
            error: 'Session expired. Please sign in again.'
        });
    }
}

// ─── REGISTER ──────────────────────────────────────

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({
                error: 'Full name must be at least 2 characters.'
            });
        }

        if (
            !email ||
            typeof email !== 'string' ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
            return res.status(400).json({
                error: 'Please enter a valid email address.'
            });
        }

        if (!password || password.length < 4) {
            return res.status(400).json({
                error: 'Password must be at least 4 characters.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existing = await findOne({
            email: normalizedEmail
        });

        if (existing) {
            return res.status(409).json({
                error: 'An account with this email already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await insert({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'customer',
            createdAt: new Date().toISOString()
        });

        return res.status(201).json({
            message: 'Account created successfully! Please sign in with your email and password.'
        });

    } catch (err) {
        console.error('Register error:', err);

        return res.status(500).json({
            error: 'Something went wrong. Please try again.'
        });
    }
});

// ─── LOGIN ─────────────────────────────────────────

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                error: 'No account found with this email. Please create an account first.'
            });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({
                error: 'Incorrect password. Please try again.'
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                name: user.name
            },
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES
            }
        );

        // Send login notification to this customer's email.
        // Email failure must not prevent login.
        sendLoginNotification({
            name: user.name,
            email: user.email
        }).catch(err => {
            console.error('Login notification error:', err.message);
        });

        return res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (err) {
        console.error('Login error:', err);

        return res.status(500).json({
            error: 'Something went wrong. Please try again.'
        });
    }
});

// ─── GET CURRENT USER ──────────────────────────────

router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await findOne({
            _id: req.user.id
        });

        if (!user) {
            return res.status(404).json({
                error: 'Account not found.'
            });
        }

        return res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (err) {
        console.error('Me error:', err);

        return res.status(500).json({
            error: 'Something went wrong.'
        });
    }
});

// ─── FORGOT PASSWORD ───────────────────────────────

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body || {};

        if (!email) {
            return res.status(400).json({
                error: 'Please enter your email address.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                error: 'No account found with this email address.'
            });
        }

        return res.json({
            message: 'Email verified.',
            name: user.name
        });

    } catch (err) {
        console.error('Forgot password error:', err);

        return res.status(500).json({
            error: 'Something went wrong. Please try again.'
        });
    }
});

// ─── RESET PASSWORD ────────────────────────────────

router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body || {};

        if (!email || !newPassword) {
            return res.status(400).json({
                error: 'Email and new password are required.'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                error: 'No account found with this email address.'
            });
        }

        const hashed = await bcrypt.hash(newPassword, 12);

        await update(
            { email: normalizedEmail },
            { $set: { password: hashed } }
        );

        return res.json({
            message: 'Password reset successfully. You can now sign in.'
        });

    } catch (err) {
        console.error('Reset password error:', err);

        return res.status(500).json({
            error: 'Something went wrong. Please try again.'
        });
    }
});

// ─── LOGOUT ────────────────────────────────────────

router.post('/logout', requireAuth, (_req, res) => {
    return res.json({
        message: 'Logged out successfully.'
    });
});

module.exports = router;