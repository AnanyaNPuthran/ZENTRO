# ZENTRO – The Future of Shopping

A modern, full-stack e-commerce web application developed using React, TypeScript, Node.js, Express.js, and NeDB.

ZENTRO provides a complete online shopping experience with customer authentication, product browsing, shopping cart, wishlist, checkout, order tracking, email notifications, and an administration portal.

## Project Overview

ZENTRO is a college project designed to demonstrate the development of a full-stack e-commerce application. It provides a modern shopping interface with a dark-themed design and an administration portal for managing products, customers, and orders.

The application includes customer registration and login, product browsing, cart and wishlist management, checkout, order placement, delivery tracking, and automated email notifications.

## Project Screenshots

### 1. Home Page

![ZENTRO Home Page](screenshots/home-page.png)

### 2. Features

![ZENTRO Features](screenshots/features.png)

### 3. Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

### 4. Order Information

![Order Information](screenshots/order-info.png)

### 5. Order Placed

![Order Placed](screenshots/order-placed.png)

### 6. Order Placed – Confirmation

![Order Placed 2](screenshots/order-placed-2.png)

### 7. Track Order

![Track Order](screenshots/track-order.png)

### 8. Login Successful Email

![Login Successful Email](screenshots/login-successful-email.png)

### 9. Order Confirmation Email

![Order Confirmation Email](screenshots/order-confirmation-email.png)

### 10. Order Confirmation Email – Additional View

![Order Confirmation Email 2](screenshots/order-confirmation-email-2.png)

## Key Features

### 1. Customer Storefront

- Product catalog with 46+ products.
- Five product categories: Fashion, Electronics, Beauty, Home, and Footwear.
- Product search and category filtering.
- Product ratings and review counts.
- Product labels such as HOT, SALE, NEW, and TRENDING.
- Responsive user interface.

### 2. Customer Authentication

- Customer registration and login.
- Email validation.
- Password hashing using bcryptjs.
- JWT-based authentication.
- Customer account management.

### 3. Shopping Cart and Wishlist

- Add products to the shopping cart.
- Increase or decrease product quantities.
- Remove products from the cart.
- Add and remove wishlist products.
- Automatic subtotal calculation.
- Shipping charge calculation.
- GST calculation.
- LocalStorage-based data persistence.

### 4. Checkout and Payment

- Indian shipping address form.
- Mobile number and PIN code validation.
- Cash on Delivery.
- Online payment simulation.
- UPI, Google Pay, PhonePe, and card payment options.
- Order confirmation screen.

**Note:** Online payment is simulated for educational and testing purposes. No real financial transactions are processed.

### 5. My Orders and Order Tracking

- View customer order history.
- Display order details and purchased products.
- Track delivery progress.
- Order status updates:
  - Processing
  - Confirmed
  - Packed
  - Shipped
  - Out for Delivery
  - Delivered

### 6. Admin Dashboard

- Separate admin login.
- Protected administration portal.
- Total revenue overview.
- Total orders overview.
- Total customers overview.
- Product catalog management.
- Customer order management.
- Update order delivery status.

### 7. Email Notifications

- Automated order confirmation emails.
- Gmail SMTP integration using Nodemailer.
- Product images embedded in email notifications using CID attachments.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 18, TypeScript |
| Build Tool | Vite |
| Styling | CSS, Flexbox, CSS Grid |
| Backend | Node.js, Express.js |
| Database | NeDB |
| Authentication | JWT, bcryptjs |
| Email Service | Nodemailer, Gmail SMTP |
| API Communication | REST API |
| Data Persistence | LocalStorage |
| Tools | VS Code, npm, Git, GitHub |

## Project Architecture

```text
Zentro/
│
├── backend/
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   └── orders.js
│   │
│   ├── utils/
│   │   └── mailer.js
│   │
│   ├── createAdmin.js
│   ├── resetAdminPassword.js
│   ├── fixAdminEmail.js
│   ├── db.js
│   ├── ordersDb.js
│   ├── productsDb.js
│   ├── .env.example
│   └── server.js
│
├── public/
│
├── screenshots/
│   ├── admin-dashboard.png
│   ├── features.png
│   ├── home-page.png
│   ├── login-successful-email.png
│   ├── order-info.png
│   ├── order-placed-2.png
│   ├── order-placed.png
│   ├── order-confirmation-email.png
│   ├── order-confirmation-email-2.png
│   └── track-order.png
│
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── Pages/
│   ├── styles/
│   └── App.tsx
│
├── .gitignore
├── README.md
├── package.json
└── vite.config.ts
```

## Getting Started

### 1. Prerequisites

- Node.js (version 18 or higher recommended)
- npm
- Visual Studio Code
- Git

### 2. Clone the Repository

```bash
git clone https://github.com/AnanyaNPuthran/ZENTRO.git
```

```bash
cd ZENTRO
```

### 3. Install Dependencies

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
npm install --prefix backend
```

### 4. Configure Environment Variables

Create a `.env` file inside the backend folder using `.env.example` as a reference.

Configure:

```env
PORT=3001
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES=30d

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_google_app_password
```

Use your own credentials. Never upload actual passwords or secret keys to GitHub.

### 5. Create an Admin Account

```bash
node backend/createAdmin.js
```

Follow the instructions to enter the admin name, email, and password.

### 6. Run the Application

```bash
npm run dev
```

Application URLs:

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Admin Portal | http://localhost:5173/admin |

The frontend port may change if port 5173 is already occupied.

## Security

- Passwords are hashed using bcryptjs.
- JWT tokens are used for authentication.
- Environment variables are stored separately.
- Sensitive files are excluded using `.gitignore`.
- Local database files are excluded from GitHub.
- Admin routes require authentication.

## Future Enhancements

- Real payment gateway integration.
- Advanced sales analytics.
- Product reviews and customer feedback.
- Improved product recommendations.
- Cloud database integration.
- Live application deployment.

## Project Information

**Project Name:** ZENTRO – The Future of Shopping

**Project Type:** Full-Stack E-Commerce Web Application

**Project Purpose:** College Academic Project

## Author

**Ananya N Puthran**

GitHub: [AnanyaNPuthran](https://github.com/AnanyaNPuthran)

## Repository

[ZENTRO – GitHub Repository](https://github.com/AnanyaNPuthran/ZENTRO)

## License

This project is licensed under the MIT License.
