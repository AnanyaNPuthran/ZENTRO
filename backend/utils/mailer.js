const nodemailer = require('nodemailer');
require('dotenv').config();

// Gmail configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Escape HTML
function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

// Format Indian currency
function formatPrice(price) {
    return Number(price || 0).toLocaleString('en-IN');
}

// Get image from product
function getImageValue(product) {
    if (!product) return '';

    let image =
        product.image ||
        product.imageUrl ||
        product.images?.[0] ||
        product.thumbnail ||
        '';

    if (typeof image === 'object' && image !== null) {
        image = image.url || image.src || '';
    }

    return typeof image === 'string' ? image.trim() : '';
}

// Validate product image URL
function getProductImage(product) {
    const image = getImageValue(product);

    if (!image) return '';

    try {
        const url = new URL(image);

        if (!['http:', 'https:'].includes(url.protocol)) {
            return '';
        }

        if (['localhost', '127.0.0.1'].includes(url.hostname)) {
            return '';
        }

        return url.href;

    } catch (error) {
        console.error('Invalid product image URL:', image);
        return '';
    }
}

// Product image HTML
function productImageHTML(imageUrl, productName) {
    if (!imageUrl) {
        return `
            <div style="
                width:80px;
                height:80px;
                background:#f3f4f6;
                border-radius:8px;
                text-align:center;
                line-height:80px;
                color:#9ca3af;
                font-size:11px;
                border:1px solid #e5e7eb;
            ">
                No Image
            </div>
        `;
    }

    return `
        <img
            src="${escapeHtml(imageUrl)}"
            alt="${escapeHtml(productName)}"
            width="80"
            height="80"
            border="0"
            style="
                width:80px;
                height:80px;
                max-width:80px;
                max-height:80px;
                object-fit:cover;
                display:block;
                border:1px solid #e5e7eb;
                border-radius:8px;
                background:#ffffff;
            "
        />
    `;
}

// Send email
async function sendEmail(to, subject, html, attachments = []) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('Email credentials are missing in .env');
        return false;
    }

    if (!to) {
        console.error('Customer email address is missing');
        return false;
    }

    try {
        const mailOptions = {
            from: `"ZENTRO - The Future of Shopping" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        if (Array.isArray(attachments) && attachments.length > 0) {
            mailOptions.attachments = attachments;
        }

        await transporter.sendMail(mailOptions);

        console.log(`Email sent successfully to ${to}`);
        return true;

    } catch (error) {
        console.error('Email sending failed:', error.message);
        return false;
    }
}

// Verify email configuration
async function verifyMailer() {
    try {
        await transporter.verify();
        console.log('Email service connected successfully.');
        return true;

    } catch (error) {
        console.error('Email service connection failed:', error.message);
        return false;
    }
}

// LOGIN NOTIFICATION
async function sendLoginNotification(user) {
    return sendEmail(
        user.email,
        'ZENTRO - Login Successful',
        `
        <div style="
            font-family:Arial,sans-serif;
            padding:25px;
            color:#222222;
        ">
            <h2>Welcome to ZENTRO!</h2>

            <p>Hello ${escapeHtml(user.name || 'Customer')},</p>

            <p>
                You have successfully logged in to your ZENTRO account.
            </p>

            <p>
                If this wasn't you, please secure your account.
            </p>

            <br>

            <strong>ZENTRO - The Future of Shopping</strong>
        </div>
        `
    );
}

// ORDER CONFIRMATION EMAIL
async function sendOrderConfirmation(order) {
    const attachments = [];

    const items = (order.items || []).map((item, index) => {
        // Support nested and direct product objects
        const product = {
            ...item,
            ...(item.product || {})
        };

        const productName = escapeHtml(
            product.name || 'Product'
        );

        const quantity = Number(item.quantity || 1);

        const price = Number(
            product.price ?? item.price ?? 0
        );

        const rawImageUrl = getProductImage(product);
        let imageSrc = rawImageUrl;

        if (rawImageUrl) {
            const cid = `prod_img_${index}_${Date.now()}@zentro`;
            attachments.push({
                filename: `product_${index}.jpg`,
                path: rawImageUrl,
                cid: cid
            });
            imageSrc = `cid:${cid}`;
        }

        console.log('Order product:', productName);
        console.log('Product image:', rawImageUrl || 'No image found');

        return `
            <tr>
                <td style="
                    padding:12px;
                    border-bottom:1px solid #eeeeee;
                    vertical-align:middle;
                ">
                    ${productImageHTML(imageSrc, productName)}
                </td>

                <td style="
                    padding:12px;
                    border-bottom:1px solid #eeeeee;
                ">
                    <strong>${productName}</strong>
                </td>

                <td style="
                    padding:12px;
                    text-align:center;
                    border-bottom:1px solid #eeeeee;
                ">
                    ${quantity}
                </td>

                <td style="
                    padding:12px;
                    text-align:right;
                    border-bottom:1px solid #eeeeee;
                ">
                    ₹${formatPrice(price * quantity)}
                </td>
            </tr>
        `;
    }).join('');

    return sendEmail(
        order.customerEmail,
        `ZENTRO - Order Confirmed (${order.orderId})`,
        `
        <div style="
            font-family:Arial,sans-serif;
            padding:25px;
            color:#222222;
            max-width:650px;
            margin:auto;
        ">

            <div style="
                background:#101827;
                padding:22px;
                text-align:center;
                border-radius:10px;
            ">
                <h1 style="color:#ffffff;margin:0;">
                    ZENTRO
                </h1>

                <p style="color:#b9c8df;margin:8px 0 0;">
                    The Future of Shopping
                </p>
            </div>

            <h2 style="color:#16a34a;margin-top:25px;">
                Your order has been confirmed!
            </h2>

            <p>
                Hello ${escapeHtml(order.customerName || 'Customer')},
            </p>

            <p>
                Thank you for shopping with ZENTRO.
                Your order has been successfully placed.
            </p>

            <div style="
                background:#f5f7fa;
                padding:15px;
                border-radius:8px;
            ">
                <p>
                    <strong>Order ID:</strong>
                    ${escapeHtml(order.orderId)}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${escapeHtml(order.status || 'Processing')}
                </p>
            </div>

            <h3 style="margin-top:25px;">
                Your Ordered Products
            </h3>

            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                    width:100%;
                    border-collapse:collapse;
                    text-align:left;
                "
            >
                <thead>
                    <tr style="
                        background:#101827;
                        color:white;
                    ">
                        <th style="padding:12px;">Image</th>
                        <th style="padding:12px;">Product</th>
                        <th style="padding:12px;text-align:center;">Qty</th>
                        <th style="padding:12px;text-align:right;">Price</th>
                    </tr>
                </thead>

                <tbody>
                    ${items}
                </tbody>
            </table>

            <h2 style="text-align:right;margin-top:25px;">
                Total: ₹${formatPrice(order.grandTotal)}
            </h2>

            <p>
                We will notify you when your order status changes.
            </p>

            <div style="
                background:#101827;
                padding:18px;
                text-align:center;
                border-radius:8px;
                margin-top:25px;
            ">
                <strong style="color:white;">
                    Thank you for choosing ZENTRO!
                </strong>

                <p style="color:#b9c8df;margin-bottom:0;">
                    The Future of Shopping
                </p>
            </div>

        </div>
        `,
        attachments
    );
}

// ORDER TRACKING UPDATE EMAIL
async function sendOrderStatusUpdate(order) {
    return sendEmail(
        order.customerEmail,
        `ZENTRO - Order ${order.orderId} Update`,
        `
        <div style="
            font-family:Arial,sans-serif;
            padding:25px;
            color:#222222;
            max-width:600px;
            margin:auto;
        ">

            <div style="
                background:#101827;
                padding:22px;
                text-align:center;
                border-radius:10px;
            ">
                <h1 style="color:white;margin:0;">
                    ZENTRO
                </h1>

                <p style="color:#b9c8df;">
                    The Future of Shopping
                </p>
            </div>

            <h2 style="color:#2563eb;">
                Your order status has been updated!
            </h2>

            <p>
                Hello ${escapeHtml(order.customerName || 'Customer')},
            </p>

            <p>
                Your order
                <strong>${escapeHtml(order.orderId)}</strong>
                has a new status:
            </p>

            <div style="
                background:#f1f5f9;
                padding:20px;
                border-radius:8px;
                text-align:center;
            ">
                <h2 style="color:#2563eb;">
                    ${escapeHtml(order.status || 'Updated')}
                </h2>
            </div>

            <p>
                Thank you for shopping with ZENTRO.
            </p>

            <br>

            <strong>ZENTRO - The Future of Shopping</strong>
        </div>
        `
    );
}

// EXPORT FUNCTIONS
module.exports = {
    sendEmail,
    verifyMailer,
    sendLoginNotification,
    sendOrderConfirmation,
    sendOrderStatusUpdate
};
