# ShopNest — Enterprise MERN E-Commerce Platform 

ShopNest is a modern, production-oriented e-commerce web application engineered using the MERN stack (MongoDB Atlas, Express.js v5, React 19, Node.js). Built with a strong **System Design Mindset**, **Security-First Architecture**, and **Database Concurrency Controls**, ShopNest delivers a seamless shopping experience for customers and a secure management portal for store administrators.

**Live URL** [https://shop-nest-e-commerce-website-n3qv.vercel.app/](https://shop-nest-e-commerce-website-f7vdy8fr1-siva-sivas-projects.vercel.app/)
---

## 🏗️ System Design & Architectural Principles

The application architecture is grounded in four fundamental engineering principles:

1. **Database-Level Atomic Concurrency**: Eliminates race conditions and inventory double-selling during peak traffic using native MongoDB atomic engine operations (`$inc`).
2. **Idempotent Order Processing**: Protects against rapid double-clicking, page refreshes, and network retries using backend time-window idempotency guards and client UI debouncing.
3. **Defense-in-Depth Security**: Enforces multi-tier authentication and authorization—protecting APIs with JWT claims verification, role-based middleware (`RBAC`), and resource ownership checks.
4. **Fault-Tolerant & Defensive UI Design**: Prevents client-side rendering crashes through optional chaining, fallback placeholder states (`"Product is not available"`), and strict payload sanitization.

---

## 🛡️ Enterprise Safeguards & Security Engineering

### 1. Duplicate-Order Prevention Guard (Idempotency)
To prevent accidental double orders caused by rapid double-clicking or network retries during checkout:
- **Backend Time-Window Guard (30s Window)**: Before initializing a new order, `POST /orders/add` queries MongoDB for an identical order placed by the same user with the same total amount within the last 30 seconds. If detected, it immediately returns HTTP `409 Conflict` with the existing order payload rather than duplicating inventory/order records.
- **Frontend UI Debouncing**: The "Place Order" button locks client state (`isPlacingOrder = true`), disables repeated clicks, and displays `"Placing Order..."` feedback.

### 2. Atomic Inventory Stock Concurrency (`$inc`)
- **Race Condition Prevention**: Stock decrements during order placement use atomic MongoDB `$inc` operators with conditional query guards (`{ stock: { $gte: quantity } }`). Operations are locked at the database engine level, guaranteeing that concurrent checkout requests cannot over-allocate stock.
- **Atomic Stock Restoration**: Order cancellations trigger automated, atomic stock restoration (`$inc: { stock: +quantity }`) executed via `Promise.all` pipelines.

### 3. JWT Role-Based Access Control (RBAC)
- **Token Verification**: Express `protect` middleware verifies incoming HTTP `Authorization: Bearer <token>` headers against `JWT_SECRET` and attaches verified claims (`req.user`) to the request object.
- **Controller Authorization Guards**: Strict server-side guards enforce role boundaries (`req.user.role === "Admin"` vs `"User"`), blocking unauthorized access to administrative telemetry, user profile lists, and product catalog mutation endpoints.

### 4. Defensive UI & Order Snapshotting
- **Null-Safety Handling**: Order history components render fallback labels (`"Product is not available"`) and placeholder thumbnails if catalog items are deleted, eliminating runtime `TypeError` crashes.
- **Historical Order Integrity**: Order receipts snapshot product prices, names, and images at checkout time, preserving historical financial records even if catalog prices change in the future.

---

## 🔒 Threat Model & Security Mitigation Matrix

| Vulnerability / Threat | Risk Level | Mitigation Strategy in ShopNest |
| :--- | :---: | :--- |
| **Race Conditions / Double-Selling** | High | MongoDB engine-level atomic `$inc` decrements with `{ stock: { $gte: qty } }` guards. |
| **Duplicate Checkout Submissions** | High | 30-second backend time-window idempotency guard (HTTP 409 Conflict) + UI button debouncing. |
| **BOLA / IDOR Attacks** | High | Server-side JWT claims verification ensuring users can only access/modify their own resources (`req.user.id === targetUserId`). |
| **Privilege Escalation** | Critical | Server-side role assignment overrides (`role: "User"` hardcoded on public signup). |
| **Client-Side Runtime Crashes** | Medium | Optional chaining (`item.product?.image`), fallback render states, and strict payload checks. |

---

## 📡 REST API Architecture

| Endpoint | Method | Allowed Roles | Description | Status Codes |
| :--- | :---: | :---: | :--- | :---: |
| `/signup` | `POST` | Public | Register new customer account | `201`, `400` |
| `/login` | `POST` | Public | Authenticate user & issue 24h JWT token | `200`, `401`, `404` |
| `/products` | `GET` | Public | Fetch product catalog with search & filters | `200` |
| `/products/add` | `POST` | `Admin` | Create new product listing | `201`, `400`, `403` |
| `/products/update/:id` | `PUT` | `Admin` | Modify existing product details | `200`, `403`, `404` |
| `/products/delete/:id` | `DELETE` | `Admin` | Remove product from catalog | `200`, `403`, `404` |
| `/cart/:userId` | `GET` | `User` / `Admin` | Fetch user shopping cart | `200`, `401` |
| `/orders/add` | `POST` | `User` | Place new COD order (Includes 30s Idempotency & Atomic Stock) | `201`, `400`, `409` |
| `/orders/my-orders` | `GET` | `User` | Fetch customer personal order history | `200`, `401`, `403` |
| `/orders/:id/cancel` | `PUT` | `User` | Cancel pending order & restore stock atomically | `200`, `400`, `403` |
| `/admin/orders` | `GET` | `Admin` | Fetch all store customer orders | `200`, `403` |
| `/admin/orders/:id/status` | `PUT` | `Admin` | Update order fulfillment status | `200`, `400`, `403` |
| `/logs` | `GET` | `Admin` | Inspect system audit telemetry logs | `200`, `403` |

---

## 🧪 Automated Testing & Verification

ShopNest includes a built-in automated test suite to verify system safeguards end-to-end.

### Running Automated Test Suite

Ensure your backend server is running (`npm start`), then execute:

```bash
cd backend
npm run test:suite
```

### What the Automated Suite Verifies:
1. **RBAC Guard Test**: Asserts that customer accounts receive HTTP `403 Access Denied` when attempting to access Admin telemetry (`/logs`).
2. **Duplicate Order Guard Test**: Asserts that rapid duplicate order requests receive HTTP `409 Conflict`.
3. **Atomic Stock Guard Test**: Asserts that excessive quantity order requests receive HTTP `400 Bad Request`.
4. **Defensive Structural Test**: Verifies response array structural integrity and null safety.

---

## 🚀 Local Setup & Installation

### 1. Clone Repository
```bash
git clone https://github.com/your-username/ShopNest.git
cd ShopNest
```

### 2. Environment Configuration

Create `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopnest
JWT_SECRET=your_jwt_secret_key_here
```

Create `.env` file in `frontend/`:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Install & Start Application

**Backend**:
```bash
cd backend
npm install
npm start
```

**Frontend**:
```bash
cd frontend
npm install
npm start
```

Access the application in your browser at `http://localhost:3000`.
