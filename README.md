# 💰 ExpenseIQ — Expense Tracker & Budget Manager

A full-stack web application for tracking income, expenses, and budgets with interactive charts.

**Stack:** Vue 3 · Bootstrap 5 · Chart.js · Node.js · Express · MongoDB

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (`node -v`)
- MongoDB running locally OR a MongoDB Atlas connection string

---

### 1. Clone / open project
```bash
cd "d:\RR\sem 4\web_project"
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env      # or copy .env.example .env  (Windows)
npm install
npm run seed              # Seeds default categories + demo user
npm run dev               # Starts on http://localhost:5000
```

**`backend/.env` variables:**
```
MONGO_URI=mongodb://localhost:27017/expense_tracker
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev               # Starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Demo Account
After running `npm run seed`:
| Field | Value |
|-------|-------|
| Email | `demo@expensetracker.com` |
| Password | `demo123456` |

---

## 📁 Project Structure

```
web_project/
├── backend/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Business logic (auth, transactions, budgets, categories, reports, dashboard)
│   ├── middleware/     # JWT auth, validation, error handler
│   ├── models/         # Mongoose schemas (User, Transaction, Category, Budget)
│   ├── routes/         # Express routers
│   ├── utils/          # Seed data script
│   ├── tests/          # Jest + Supertest unit tests
│   ├── .env.example
│   └── server.js
│
└── frontend/
    └── src/
        ├── assets/      # Global CSS design system
        ├── components/  # Navbar, Sidebar, Charts, Modals, Cards, Toast
        ├── views/       # Dashboard, Transactions, Budget, Categories, Reports, Auth
        ├── router/      # Vue Router (auth guards)
        ├── store/       # Pinia stores (auth, transactions, categories, budgets, ui)
        └── services/    # Axios API modules
```

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

---

## 🌟 Features

| Feature | Details |
|---------|---------|
| **Auth** | JWT register/login, bcrypt passwords |
| **Dashboard** | Summary cards, doughnut chart, line trend, recent transactions |
| **Transactions** | Add/edit/delete, filter by type/category/month/search, CSV export |
| **Budget** | Category monthly budgets, live progress bars, over-budget alerts |
| **Categories** | 16 predefined + unlimited custom categories |
| **Reports** | Monthly bar chart, category pie, year-over-year comparison |
| **Dark Mode** | Full light/dark mode toggle, persisted in localStorage |
| **Responsive** | Mobile-friendly with slide-in sidebar |

---

## 🐳 Docker (Optional)

```yaml
# docker-compose.yml (create in root)
version: '3.8'
services:
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
  backend:
    build: ./backend
    ports: ["5000:5000"]
    environment:
      MONGO_URI: mongodb://mongo:27017/expense_tracker
      JWT_SECRET: your_secret
    depends_on: [mongo]
```

---

## ☁️ Deployment

### Backend → Render
1. Create a new **Web Service** pointing to `/backend`
2. Set **Build command**: `npm install`
3. Set **Start command**: `node server.js`
4. Add env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`

### Frontend → Vercel
1. Import the repo, set **Root Directory** to `frontend`
2. Framework preset: **Vite**
3. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`
   (update `services/api.js` baseURL to use `import.meta.env.VITE_API_URL`)

### Database → MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Copy connection string → set as `MONGO_URI` in backend env

---

## 🔐 Security Notes
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire in 7 days
- All routes except login/register are protected
- Input validated with express-validator
- CORS configured to frontend origin only
