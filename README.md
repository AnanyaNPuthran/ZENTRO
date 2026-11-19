# 🛍️ ZENTRO – The Future of Shopping

A modern, full-stack eCommerce web application built with a responsive React frontend, an Express REST API backend, lightweight persistent NoSQL storage, and automated transactional Gmail notifications.

---

## 📌 Project Overview

**ZENTRO** is an end-to-end eCommerce platform designed to deliver an intuitive shopping experience for customers and a comprehensive management portal for administrators. 

The project features a sleek futuristic dark-mode UI, seamless client-side state management, real-time cart and wishlist synchronization, automated multi-step checkout with simulated payment verification, customer order tracking, and transactional email confirmations with embedded product images.

---

## 🚀 Key Features

### 🛒 1. Customer Storefront
* **Product Catalog (46+ items):** Spans across 5 categories: *Fashion, Electronics, Beauty, Home, and Footwear*. Includes real-time search, category filtering, badges (*HOT, SALE, NEW, TRENDING*), and interactive star ratings.
* **Shopping Cart & Wishlist Drawers:** Dynamic slide-out drawers with quantity adjustments, real-time subtotal/shipping/GST calculations, and persistent localStorage sync.
* **Customer Authentication:** 
  * Registration & login with standard email validation across any domain.
  * Auto-redirects to sign-in with pre-filled email upon account creation.
  * Secure password hashing using **bcryptjs (12 salt rounds)** and stateless **JWT** session tokens.

### 💳 2. Checkout & Payment Simulation
* **Comprehensive Shipping Form:** Validation for 10-digit Indian mobile numbers, 6-digit PIN codes, and Indian state selection.
* **Flexible Payment Methods:**
  * **Cash on Delivery (COD)** with instant order confirmation.
  * **Online Payment Simulator:** Simulated checkout experience supporting UPI, Google Pay, PhonePe, and Credit/Debit Cards.
  * Realistic processing states, animated **Payment Successful** confirmation overlay, and automated order submission.
  *(Note: Online payment is a simulated demo flow for educational and testing purposes; no real monetary transactions take place).*

### 📦 3. Customer Order Tracking ("My Orders")
* **User-Specific Order Isolation:** Customers only see their own order history; each user's purchase records remain private to their account.
* **Real-Time Delivery Stages:** Live progress tracker showing order status:
  `Processing` ➔ `Confirmed` ➔ `Packed` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered`.

### 🛡️ 4. Administration Portal (`/admin`)
* **Dedicated Admin Login:** Gated route with custom credentials and password visibility toggle (👁️).
* **Live Store Analytics Dashboard:** Real-time metrics for Total Revenue, Total Orders, Total Customers, and Product Catalog size.
* **Order Management System:** Admins can view customer orders and update shipment delivery stages, which immediately reflect on the customer's dashboard.
* **Product Catalog Sync:** Synchronization between frontend catalog and database.

### ✉️ 5. Automated Email Receipts (Gmail SMTP)
* **Transactional Order Confirmations:** Sends an automated receipt to the customer's registered email address upon order placement.
* **Embedded Product Photography (CID Attachments):** Embeds actual product photos directly into the email payload via `cid:` inline attachments, allowing images to render immediately across mail clients without relying on external image hosts.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Modern CSS (Variables, Flexbox/Grid, Glassmorphism, Keyframe Animations) |
| **Backend** | Node.js, Express.js, CORS, Dotenv |
| **Database** | NeDB (`@seald-io/nedb`) — Serverless, embedded, file-based NoSQL database (`zentro_users.db`, `zentro_products.db`, `zentro_orders.db`) |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`) |
| **Email Service** | Nodemailer with Gmail SMTP & Inline CID Attachments |
| **Tooling** | Concurrently, Vite HMR, npm |

---

## 📂 Architecture & Directory Structure

```text
Zentro/
├── backend/
│   ├── routes/
│   │   ├── admin.js              # Admin login, analytics stats, order updates
│   │   ├── auth.js               # Register, login, session validation
│   │   └── orders.js             # Customer order creation and user-filtered retrieval
│   ├── utils/
│   │   └── mailer.js             # Nodemailer SMTP transporter & CID image email templates
│   ├── createAdmin.js            # Interactive CLI script to create an admin account
│   ├── resetAdminPassword.js     # Interactive CLI script to reset an admin password
│   ├── fixAdminEmail.js          # Interactive CLI script to update an admin email
│   ├── db.js                     # Users database setup
│   ├── ordersDb.js               # Orders database setup
│   ├── productsDb.js             # Products database setup
│   ├── .env.example              # Environment variables template
│   └── server.js                 # Express application entry point (Port 3001)
├── src/
│   ├── components/
│   │   ├── auth/                 # Login & Registration views
│   │   ├── cart/                 # Cart slide-over drawer
│   │   ├── checkout/             # Multi-step checkout & Order success screens
│   │   ├── home/                 # Hero banner, product grid & card components
│   │   ├── layout/               # Header navbar, user menu & footer
│   │   ├── orders/               # My Orders history & delivery tracker
│   │   ├── ui/                   # Toast notifications & UI widgets
│   │   └── wishlist/             # Wishlist slide-over drawer
│   ├── context/                  # React Context providers (Auth, Cart, Wishlist, Orders, Nav)
│   ├── data/                     # Product catalog dataset (46+ curated items)
│   ├── Pages/                    # Admin Login & Admin Dashboard views
│   ├── styles/                   # Modular CSS stylesheets (dark theme, glassmorphism)
│   └── App.tsx                   # Root router & application entry
├── .gitignore                    # Protects secrets (.env) and local database files
├── package.json                  # Root configuration with concurrent dev scripts
└── vite.config.ts                # Vite build and bundling configuration
```

---

## ⚡ Getting Started Locally

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (bundled with Node.js)

### 2. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/Zentro.git
cd Zentro
```

### 3. Install Dependencies
Install dependencies for both the root (frontend) and backend:
```bash
npm install
npm install --prefix backend
```

### 4. Environment Variables Setup
Create a `.env` file inside the `backend` directory based on `.env.example`:
```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and configure your environment:
```env
PORT=3001
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES=30d

# Optional: Configure Gmail SMTP for real order confirmation emails
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_character_google_app_password
```
*(If Gmail credentials are not provided, order placement continues normally while email dispatch is safely skipped).*

### 5. Create an Admin Account
To access the Admin Portal (`/admin`), create your local admin credentials using the interactive setup utility:
```bash
node backend/createAdmin.js
```
Follow the interactive prompts to enter your admin name, email, and password.

*(To reset your password later, you can run `node backend/resetAdminPassword.js` at any time).*

### 6. Run the Application
Start both the Frontend and Backend concurrently with a single command:
```bash
npm run dev
```

* **Frontend Storefront:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:3001](http://localhost:3001)
* **Admin Portal:** [http://localhost:5173/admin](http://localhost:5173/admin)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
