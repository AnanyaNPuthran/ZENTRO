const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const productsDb = require('../productsDb');
const ordersDb = require('../ordersDb');
const { sendOrderStatusUpdate } = require('../utils/mailer');

const router = express.Router();

const JWT_SECRET =
    process.env.JWT_SECRET || 'zentro_default_jwt_secret_change_in_production';

const DELIVERY_STATUSES = [
    'Processing',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered'
];

// DATABASE HELPER FUNCTIONS

const findOne = (database, query) =>
    new Promise((resolve, reject) => {
        database.findOne(query, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });

const countDocuments = (database, query) =>
    new Promise((resolve, reject) => {
        database.count(query, (err, count) => {
            if (err) reject(err);
            else resolve(count);
        });
    });

const findMany = (database, query) =>
    new Promise((resolve, reject) => {
        database.find(query, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });

// ADMIN LOGIN

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required.'
            });
        }

        const admin = await findOne(db, {
            email: email.trim().toLowerCase()
        });

        if (!admin || admin.role !== 'admin') {
            return res.status(401).json({
                error: 'Invalid admin email or password.'
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            admin.password
        );

        if (!validPassword) {
            return res.status(401).json({
                error: 'Invalid admin email or password.'
            });
        }

        const token = jwt.sign(
            {
                id: admin._id,
                email: admin.email,
                role: 'admin'
            },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.json({
            message: 'Admin login successful.',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);

        return res.status(500).json({
            error: 'Server error. Please try again.'
        });
    }
});

// VERIFY ADMIN TOKEN

async function requireAdmin(req, res, next) {
    try {
        const header = req.headers.authorization || '';

        if (!header.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Admin authentication required.'
            });
        }

        const decoded = jwt.verify(
            header.slice(7),
            JWT_SECRET
        );

        if (decoded.role !== 'admin') {
            return res.status(403).json({
                error: 'Admin access denied.'
            });
        }

        const admin = await findOne(db, {
            _id: decoded.id
        });

        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({
                error: 'Admin account not found.'
            });
        }

        req.admin = admin;
        next();

    } catch (error) {
        return res.status(401).json({
            error: 'Invalid or expired admin session.'
        });
    }
}

// VERIFY ADMIN ACCOUNT

router.get('/me', requireAdmin, (req, res) => {
    return res.json({
        admin: {
            id: req.admin._id,
            name: req.admin.name,
            email: req.admin.email,
            role: 'admin'
        }
    });
});

// SYNC FRONTEND PRODUCTS TO DATABASE

router.post('/sync-products', requireAdmin, async (req, res) => {
    try {
        const products = req.body.products;

        if (!Array.isArray(products)) {
            return res.status(400).json({
                error: 'Invalid products data.'
            });
        }

        for (const product of products) {
            if (!product.id || !product.name) {
                continue;
            }

            await new Promise((resolve, reject) => {
                productsDb.update(
                    { id: product.id },
                    { $set: product },
                    { upsert: true },
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        return res.json({
            message: 'Products synced successfully.',
            totalProducts: products.length
        });

    } catch (error) {
        console.error('Product sync error:', error);

        return res.status(500).json({
            error: 'Unable to sync products.'
        });
    }
});

// GET ALL CUSTOMER ORDERS

router.get('/orders', requireAdmin, async (req, res) => {
    try {
        const orders = await findMany(ordersDb, {});

        orders.sort((a, b) =>
            new Date(b.placedAt).getTime() -
            new Date(a.placedAt).getTime()
        );

        return res.json({
            orders
        });

    } catch (error) {
        console.error('Fetch orders error:', error);

        return res.status(500).json({
            error: 'Unable to load customer orders.'
        });
    }
});

// UPDATE ORDER STATUS AND SEND EMAIL

router.patch('/orders/:orderId/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body || {};
        const { orderId } = req.params;

        if (!status || !DELIVERY_STATUSES.includes(status)) {
            return res.status(400).json({
                error: 'Invalid delivery status.'
            });
        }

        // Find existing order
        const order = await findOne(ordersDb, { orderId });

        if (!order) {
            return res.status(404).json({
                error: 'Order not found.'
            });
        }

        // Check whether status changed
        const statusChanged = order.status !== status;

        // Update order in database
        await new Promise((resolve, reject) => {
            ordersDb.update(
                { orderId },
                {
                    $set: {
                        status,
                        updatedAt: new Date().toISOString()
                    }
                },
                {},
                (err, numberUpdated) => {
                    if (err) return reject(err);

                    if (!numberUpdated) {
                        return reject(
                            new Error('Order status was not updated.')
                        );
                    }

                    resolve();
                }
            );
        });

        // Send customer email only if status changed
        let emailSent = false;

        if (statusChanged) {
            if (order.customerEmail) {
                emailSent = await sendOrderStatusUpdate({
                    customerEmail: order.customerEmail,
                    customerName: order.customerName,
                    orderId: order.orderId,
                    status
                });
            } else {
                console.error(
                    `Customer email missing for order ${orderId}`
                );
            }
        }

        return res.json({
            message: 'Delivery status updated successfully.',
            orderId,
            previousStatus: order.status,
            status,
            statusChanged,
            emailSent
        });

    } catch (error) {
        console.error('Order status update error:', error);

        return res.status(500).json({
            error: 'Unable to update delivery status.'
        });
    }
});

// DASHBOARD STATISTICS

router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const totalCustomers = await countDocuments(db, {
            role: { $ne: 'admin' }
        });

        const totalProducts = await countDocuments(productsDb, {});

        const totalOrders = await countDocuments(ordersDb, {});

        const orders = await findMany(ordersDb, {});

        const totalRevenue = orders.reduce((total, order) => {
            return total + Number(order.grandTotal || 0);
        }, 0);

        return res.json({
            totalCustomers,
            totalProducts,
            totalOrders,
            totalRevenue
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);

        return res.status(500).json({
            error: 'Unable to load dashboard statistics.'
        });
    }
});

module.exports = router;
