
# Restaurant Management System (RMS)

A full-stack Restaurant Management System built to handle the complete restaurant workflow — from table orders and kitchen preparation to billing and staff management — with role-based access for different staff types.

## 🧑‍🍳 Roles

The system is designed around role-based accounts, each with its own view and permissions:

- **Manager / Admin** — Full access: manage staff, menu, stock, tables, and view dashboard/reports.
- **Cashier** — Handles billing, payments, and unpaid bill tracking.
- **Waiter** — Creates and manages orders, assigns tables.
- **Kitchen Staff** — Views incoming orders on the Kitchen Display and updates order status as items are prepared.

## ✨ Features

- **Order & Billing**
  - Create new orders per table
  - Generate and manage bills
  - Track and settle unpaid bills
- **Kitchen Display System**
  - Real-time view of incoming orders for kitchen staff
  - Order status updates (e.g. preparing, ready)
- **Staff Management**
  - Role-based staff login (Manager, Cashier, Waiter, Kitchen Staff)
  - Create, update, and manage staff accounts
- **Table, Menu & Stock Management**
  - Manage tables and their availability
  - Add/edit/remove menu items
  - Track stock levels
- **Admin Dashboard & Settings**
  - Overview dashboard for managers
  - Application/system settings

## 🛠️ Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB (via `connectDb.js`)

**Frontend**
- React + TypeScript
- Vite

📁 Project Structure

Rest.../
├── backend/
│   ├── models/
│   │   ├── bill.js
│   │   ├── createOrder.js
│   │   ├── login.js
│   │   ├── loginStaff.js
│   │   ├── menu.js
│   │   ├── stock.js
│   │   └── table.js
│   ├── .env.example
│   ├── connectDb.js
│   ├── index.js
│   └── package.json
│
└── frontend/
    ├── assets/
    ├── src/
    │   ├── components/
    │   │   ├── AdminDashboard.tsx
    │   │   ├── BillingManager....tsx
    │   │   ├── CreateBill.tsx
    │   │   ├── CreateOrder.tsx
    │   │   ├── DailyOrderItem....tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── KitchenDisplay....tsx
    │   │   ├── LoginScreen.tsx
    │   │   ├── MenuManager....tsx
    │   │   ├── Orders.tsx
    │   │   ├── Setting.tsx
    │   │   ├── StaffLoginpage.tsx
    │   │   ├── StaffManager.tsx
    │   │   ├── StockManagem....tsx
    │   │   ├── Table.tsx
    │   │   └── UnPaidBill.tsx
    │   ├── App.tsx
    │   ├── db.ts
    │   ├── index.css
    │   ├── main.tsx
    │   ├── translations.ts
    │   └── types.ts
    ├── .env
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts

## ⚙️ Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local instance or a MongoDB Atlas cluster)
- npm (comes with Node.js)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Rest...
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder (use `.env.example` as a reference):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend server:

```bash
node index.js
```

The backend should now be running on `http://localhost:5000` (or the port you set).

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder (use `.env.example` as a reference):

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend dev server:

```bash
npm run dev
```

The frontend should now be running on `http://localhost:5173` (Vite's default port).

### 4. Build for Production

```bash
cd frontend
npm run build
```

## 🔑 Environment Variables

| Variable | Location | Description |
|---|---|---|
| `PORT` | backend | Port the Express server runs on |
| `MONGO_URI` | backend | MongoDB connection string |
| `JWT_SECRET` | backend | Secret key used for signing auth tokens |
| `VITE_API_URL` | frontend | Base URL the frontend uses to call the backend API |

> ⚠️ Never commit your actual `.env` file. Use `.env.example` to document required variables without exposing secrets.

## 📌 Notes

- Staff accounts are role-restricted — each login (`login.js` / `loginStaff.js`) determines which dashboard/view (`AdminDashboard`, `StaffLoginpage`, `KitchenDisplay`, etc.) the user is routed to.
- `translations.ts` suggests multi-language support is available in the frontend.

## 📄 License

Add your license here (e.g. MIT).

---

Let me know if you'd like me to adjust the license section, add API endpoint documentation, add screenshots, or generate this as an actual `.md` file for download.