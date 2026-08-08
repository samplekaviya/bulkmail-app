# 📧 Bulk Mail Application (MERN Stack)

A full-stack bulk email sender built with **React (Vite)**, **Node.js/Express**, **MongoDB**, and **Nodemailer**. Includes admin login, a form to compose and send bulk emails, per-recipient send status, and a searchable send history.

---

## Features

- 🔐 **Admin login** — single-admin JWT authentication (credentials set via `.env`)
- ✉️ **Send bulk email** — subject, HTML body, and multiple recipients (comma or newline separated)
- ✅ **Client + server-side validation** with clear success/failure messages
- 📊 **Per-recipient status** — see exactly which addresses succeeded or failed
- 🗂️ **Email history** — every campaign is saved to MongoDB and browsable, with expandable details
- 🧾 **Error handling & logging** on both frontend and backend

---

## Project Structure

```
bulk-mail-app/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── models/Email.js       # Mongoose schema for sent-email records
│   ├── middleware/auth.js    # JWT auth middleware
│   ├── routes/authRoutes.js  # POST /api/auth/login
│   ├── routes/mailRoutes.js  # POST /api/mail/send, GET /api/mail/history
│   ├── utils/mailer.js       # Nodemailer wrapper
│   ├── server.js             # Express app entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js          # Axios instance + auth token interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/Navbar.jsx
    │   ├── pages/Login.jsx
    │   ├── pages/SendMail.jsx
    │   ├── pages/History.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── .env.example
```

---

## 1. Prerequisites

- Node.js 18+
- A running MongoDB instance (local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- An SMTP account to send mail from. The easiest option for testing is Gmail with an **App Password**:
  1. Enable 2-Step Verification on the Google account.
  2. Go to Google Account → Security → App Passwords → generate one for "Mail".
  3. Use that 16-character password as `SMTP_PASS`.

  Any other SMTP provider (SendGrid, Mailgun, Outlook, etc.) also works — just update the `SMTP_*` values.

---

## 2. Backend Setup

```bash
cd backend
cp .env.example .env
# edit .env with your MongoDB URI, JWT secret, admin credentials, and SMTP details
npm install
npm run dev        # starts on http://localhost:5000 (nodemon)
# or: npm start
```

### Backend environment variables (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credentials for the single admin user |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | SMTP transport config for Nodemailer |
| `MAIL_FROM_NAME` | Display name used in the "From" header |
| `CLIENT_ORIGIN` | Frontend URL, used for CORS |

### API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Log in with admin email/password, returns a JWT |
| POST | `/api/mail/send` | Bearer token | Send an email to a list of recipients; logs the result |
| GET | `/api/mail/history` | Bearer token | List the most recent 200 sent campaigns |
| GET | `/api/mail/history/:id` | Bearer token | Get full detail for one campaign |
| GET | `/api/health` | Public | Health check |

---

## 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# edit VITE_API_URL if your backend isn't on http://localhost:5000/api
npm install
npm run dev         # starts on http://localhost:5173
```

Open `http://localhost:5173`, log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `backend/.env`, and start sending mail.

---

## 4. How It Works

1. **Login** — `Login.jsx` posts credentials to `/api/auth/login`. The backend checks them against `.env` values and returns a signed JWT, which is stored in `localStorage` and attached to every subsequent request via an Axios interceptor.
2. **Send Mail** — `SendMail.jsx` validates the subject, body, and recipient list client-side, then posts to `/api/mail/send`. The backend re-validates, loops through recipients sending each one individually with Nodemailer (so a single bad address doesn't block the rest), and saves a record — subject, body, recipients, per-recipient result, and overall status (`sent` / `partial` / `failed`) — to MongoDB.
3. **History** — `History.jsx` fetches `/api/mail/history` and renders a table of past campaigns, each expandable to show the full body and per-recipient outcome.

---

## 5. Notes & Possible Extensions

- This demo uses a single hardcoded admin (via `.env`) for simplicity. For a production app, swap this for a proper `Admin` collection with hashed passwords (bcrypt) and, ideally, refresh tokens.
- Nodemailer sends emails **individually** to each recipient (not BCC) so per-recipient failures can be tracked and displayed. For very large recipient lists, consider a queue (e.g. Bull/BullMQ + Redis) to throttle sends and avoid SMTP provider rate limits.
- CSV upload for recipients, email templates, and scheduled sending would be natural next features.
