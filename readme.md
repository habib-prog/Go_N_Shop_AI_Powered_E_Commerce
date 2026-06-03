# 🛒 Go N Shop

Go N Shop is a modern single-vendor e-commerce platform built with Node.js, Express, MongoDB, React, and Zod validation. This project is designed as a production-style backend and frontend system to simulate real-world e-commerce workflows, focusing on clean architecture, secure authentication, and scalable design.

---

# 📁 Monorepo Layout

- `server.js` and the existing backend stay at the repo root
- `apps/web` holds the React frontend starter
- `npm install` at the repo root will manage both workspaces
- `npm run dev:api` starts the backend
- `npm run dev:web` starts the frontend

---

# 🚀 Features

## 🔐 Authentication System

- User Registration (Sign Up)
- Email OTP Verification
- OTP Expiry Validation
- Resend OTP Support
- OTP Cooldown Protection
- Temporary Abuse Lock for OTP Requests
- User Login (Sign In)
- JWT-based Authentication
- Password Hashing with bcrypt
- Protected Routes
- Logout from All Devices
- Role-based Access (Admin/User)
- User Ban / Unban (Admin Control)
- Reset Password System
- Account Deletion

---

## 👤 User Features

- View and Update Profile
- Browse Products
- Browse Products with Pagination
- View Product Details
- Add to Cart
- Place Orders
- View Order History

---

## 🧑‍💼 Admin Features

- Add New Products
- Update Products
- Delete Products
- Manage Users (Ban / Unban)
- View Paginated User List
- View All Orders
- Bulk Product Upload (CSV Support)

---

## 📦 Product System

- Product Listing
- Pagination Support for Product Listing
- Stock Management
- Automatic Stock Update after Order
- Product Validation using Zod
- Image Support for Products

---

## 🛒 Order System

- Create Orders
- Order Status Tracking (Pending, Completed, etc.)
- Auto Stock Reduction
- User Order History

---

## ⚡ Validation & Security

- Zod Schema Validation
- JWT Authentication Middleware
- Secure API Structure
- Centralized Error Handling
- Input Validation on All Requests

---

# 🧪 Testing

- Vitest is used for unit testing, including authentication flow testing such as sign up logic.

---

# 🏗️ Tech Stack

## Frontend

- React
- Tailwind CSS

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Security & Validation

- Zod
- bcrypt
- JWT

## Testing

- Vitest

---

# 📝 Change Set

## Versioning Rules

- `patch` means small fixes, bug fixes, typo fixes, or refactors that do not change the feature set
- `minor` means new features or meaningful improvements that stay backward compatible
- `major` means breaking changes that can affect existing API behavior, contracts, or usage

## Current Change Set

### patch

- Added Redis-based OTP cooldown support
- Removed OTP resend tracking fields from `userSchema`
- Added Redis config and smoke test support
- Fixed OTP resend rate-limit flow logic

### minor

- Refined OTP resend and verification flow
- Improved authentication documentation and status tracking

### major

- No major breaking auth change yet
