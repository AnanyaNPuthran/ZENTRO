const express = require('express');
const router = express.Router();
const ordersDb = require('../ordersDb');
const { sendOrderConfirmation } = require('../utils/mailer');

// SAVE CUSTOMER ORDER
router.post('/', (req, res) => {
    const order = req.body;

    if (
        !order.orderId ||
        !Array.isArray(order.items) ||
        typeof order.grandTotal !== 'number'
    ) {
        return res.status(400).json({
            error: 'Invalid order information.'
        });
    }

    if (!order.customerEmail) {
        return res.status(400).json({
            error: 'Customer email is required.'
        });
    }

    const newOrder = {
        ...order,
        status: order.status || 'Processing',
        paymentStatus: order.paymentStatus || 'Pending',
        placedAt: order.placedAt || new Date().toISOString()
    };

    ordersDb.insert(newOrder, async (err, savedOrder) => {
        if (err) {
            console.error('Order save error:', err);

            return res.status(500).json({
                error: 'Unable to save order.'
            });
        }

        try {
            await sendOrderConfirmation(savedOrder);
        } catch (emailError) {
            console.error('Order confirmation email error:', emailError);
        }

        return res.status(201).json({
            message: 'Order saved successfully.',
            order: savedOrder
        });
    });
});


// GET ALL CUSTOMER ORDERS (or filter by email: /api/orders?email=user@example.com)
router.get('/', (req, res) => {
    const query = {};
    if (req.query.email) {
        query.customerEmail = req.query.email.trim().toLowerCase();
    }

    ordersDb.find(query)
        .sort({ placedAt: -1 })
        .exec((err, orders) => {
            if (err) {
                console.error('Order fetch error:', err);

                return res.status(500).json({
                    error: 'Unable to fetch orders.'
                });
            }

            return res.status(200).json(orders);
        });
});


// GET A SINGLE ORDER BY ORDER ID
router.get('/:orderId', (req, res) => {
    ordersDb.findOne(
        { orderId: req.params.orderId },
        (err, order) => {
            if (err) {
                return res.status(500).json({
                    error: 'Unable to fetch order.'
                });
            }

            if (!order) {
                return res.status(404).json({
                    error: 'Order not found.'
                });
            }

            return res.status(200).json(order);
        }
    );
});

module.exports = router;