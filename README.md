# Authify

A modern authentication and user management API built with Node.js, Express, and MongoDB. Authify provides secure registration, login, email verification, password reset, and admin user management features.

---

## Features

- User registration with email verification
- Secure login/logout with JWT and refresh tokens
- Password reset via email
- Role-based access control (user/admin)
- Admin endpoints for user management
- Built with modular, scalable architecture

## Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** (with Mongoose)
- **JWT** for authentication
- **bcrypt** for password hashing
- **Nodemailer** for email
- **dotenv** for environment variables

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd Authify
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory and add:

```env
PORT=5000
DB_URI=mongodb://localhost:27017
USER_ACCESS_TOKEN_SECRET_KEY=your_user_jwt_secret
ADMIN_ACCESS_TOKEN_SECRET_KEY=your_admin_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### 4. Start the development server

```bash
npm run dev
```

---

## Available Scripts

- `npm run dev` — Start the server with nodemon and dotenv

---

## API Endpoints

### User Routes (`/api/v1/users`)

- `POST   /register` — Register a new user
- `POST   /login` — Login user
- `POST   /logout` — Logout user (JWT required)
- `GET    /verify/:token` — Verify email
- `GET    /resend-verify` — Resend verification link
- `POST   /forgot-password` — Request password reset
- `GET    /change-password` — Validate reset token
- `POST   /change-password` — Reset password (forgotten)
- `POST   /reset-password` — Change password (logged in)

### Admin Routes (`/api/v1/admin`)

- `GET    /users` — Get all users (admin only)
- `DELETE /users/:id` — Delete user (admin only)
- `PATCH  /users/:id/role` — Change user role (admin only)

---

## Folder Structure

```
Authify/
├── src/
│   ├── app.js
│   ├── index.js
│   ├── constant.js
│   ├── db/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── utils/
├── package.json
├── .gitignore
└── README.md
```

---

## License

This project is licensed under the ISC License.
