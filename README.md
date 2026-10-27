# Goodplate : MERN Food Rescue Platform

Goodplate helps campus communities share safe surplus food, reserve portions, and reduce avoidable food waste. This repository contains a React frontend and an Express/MongoDB backend with real signup/login/logout and protected routes.
## Live Demo Link
https://drive.google.com/file/d/1SANdfO1TRx_NZOEbCbUDauGvB1WI-W47/view?usp=sharing

## Features

- Signup and login with server-side validation and bcrypt password hashing (12 rounds).
- JWT session in an `HttpOnly` cookie; client JavaScript cannot read the token.
- Logout clears the session cookie; protected React routes redirect guests to login.
- MongoDB models for users, meals, and reservations.
- Browse/search/filter/sort available meals.
- Authenticated users can publish listings, reserve a portion, cancel reservations, mark meals picked up, and close their own listings.
- Ownership checks prevent users from closing another person's listing.
- Basic security hardening: Helmet, CORS allowlist, JSON body limit, rate limiting on authentication endpoints, and generic login errors.
- Responsive beige/ink/sage UI with Playfair Display and DM Sans.

## Requirements

- Node.js 20 or newer recommended
- npm
- MongoDB Atlas account or local MongoDB

## 1. Configure MongoDB Atlas

1. In MongoDB Atlas, create a database user under **Database Access**.
2. Under **Network Access**, allow your development IP address. Avoid opening access to every IP permanently.
3. Choose **Connect → Drivers** and copy the Node.js connection URI.
4. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` to your URI. Replace the database username/password placeholders with your database user's credentials. URL-encode special characters in the password if needed.
5. Set `JWT_SECRET` to a random secret of at least 32 characters. You can generate one with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
6. Never commit `.env` or expose the Atlas URI in frontend code. The root `.gitignore` already excludes `.env` files.

Example `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://DB_USER:DB_PASSWORD@YOUR_CLUSTER.mongodb.net/goodplate?retryWrites=true&w=majority
JWT_SECRET=paste_your_generated_random_secret_here
COOKIE_NAME=goodplate_token
```

## 2. Run locally

From the project root:

```bash
npm install
npm run install:all
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` with your actual values, then run:

```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend health check: http://localhost:5000/api/health

The frontend `.env` defaults to `VITE_API_URL=http://localhost:5000/api`.

## API overview

### Authentication

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create account and log in |
| POST | `/api/auth/login` | Public | Verify credentials and log in |
| POST | `/api/auth/logout` | Public | Clear auth cookie |
| GET | `/api/auth/me` | Authenticated | Get current user |

### Meals and reservations

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/meals` | Public | Browse meals; optional `search`, `category`, `sort` query parameters |
| POST | `/api/meals` | Authenticated | Create a listing |
| GET | `/api/meals/mine` | Authenticated | List your listings |
| PATCH | `/api/meals/:id/close` | Owner only | Close your listing |
| POST | `/api/meals/:id/reserve` | Authenticated | Reserve one portion |
| GET | `/api/meals/reservations/mine` | Authenticated | List your reservations |
| PATCH | `/api/meals/reservations/:id` | Reservation owner | Set status to `picked-up` or `cancelled` |

## Notes before production

- Configure HTTPS and set `NODE_ENV=production` in production so the auth cookie is marked `Secure`.
- Use a narrow production `CLIENT_URL`; don't use wildcard credentialed CORS.
- Consider CSRF protection, email verification, password reset, account deletion, and audit logging before real-world launch.
- Reservation quantity is conditionally decremented to reduce overselling, but full multi-document atomicity requires MongoDB transactions on a replica set. If deploying with concurrent users, implement a transaction for the meal decrement + reservation insert.
- Seed/demo meals are intentionally not inserted automatically; new users will see listings created by users in the database.
- The current frontend expects pickup expiry to be provided as a real date/time when creating a listing.

## Project structure

```text
goodplate-mern/
├── client/                  # React + Vite app
│   └── src/
│       ├── components/      # Layout, protected route, meal cards/forms
│       ├── context/         # Authentication context
│       ├── pages/           # Login, signup, dashboard, discover, share, etc.
│       └── lib/api.js       # API helper (credentials included)
├── server/                  # Express API
│   └── src/
│       ├── config/          # MongoDB connection
│       ├── controllers/     # Authentication and meal logic
│       ├── middleware/      # Auth middleware
│       ├── models/          # User, Meal, Reservation
│       └── routes/          # API routes
└── README.md
```
