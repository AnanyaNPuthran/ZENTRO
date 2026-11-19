// ─── Zentro Backend Server ─────────────────────────────

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const ordersRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ─────────────────────────────────────────

app.use(cors({
    origin: (origin, callback) => {
        if (
            !origin ||
            /^http:\/\/localhost:\d+$/.test(origin)
        ) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// ─── API Routes ─────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', ordersRoutes);

// ─── Health Check ───────────────────────────────────────

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Zentro backend is running.'
    });
});

// ─── 404 Handler ────────────────────────────────────────

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found.'
    });
});

// ─── Error Handler ──────────────────────────────────────

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    res.status(500).json({
        error: 'Internal server error.'
    });
});

// ─── Start Server ───────────────────────────────────────

app.listen(PORT, () => {
    console.log('');
    console.log('ZENTRO Backend');
    console.log(`Running at: http://localhost:${PORT}`);
    console.log('Database: zentro_users.db');
    console.log('');
});