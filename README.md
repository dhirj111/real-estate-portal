live link  = https://real-estate-portal-production-ecf9.up.railway.app/


# 🏠 EstateHub — Real-Estate Buyer Portal

A full-stack web application for browsing real-estate listings and managing your saved properties, built with Node.js, Express, MongoDB (Mongoose), and vanilla JavaScript.

---

## 1. Prerequisites

| Requirement | Version / Notes |
|-------------|----------------|
| Node.js     | ≥ 18.x         |
| npm         | ≥ 9.x          |
| MongoDB     | ≥ 6.x — must be running locally (or provide a remote URI in `.env`) |

**Install MongoDB Community Edition** (if not already installed):
- **Windows**: https://www.mongodb.com/try/download/community
- **macOS**: `brew tap mongodb/brew && brew install mongodb-community`
- **Linux**: https://www.mongodb.com/docs/manual/administration/install-on-linux/

---

## 2. Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd real-estate-portal

# 2. Install all dependencies
npm install

# 3. Create your environment file
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux
# (Optional) Edit .env and set a strong JWT_SECRET and MONGO_URI

# 4. Start MongoDB (if not running as a system service)
#    Windows (run in a separate terminal):
net start MongoDB
#    macOS:
# brew services start mongodb-community
#    Or start manually:
# mongod --dbpath /data/db

# 5. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**.

Eight seed property listings are inserted automatically on first run — no manual migration needed.

---

## 3. Example Flows

### Flow A: Sign Up → Login → Browse → Add Favourite

1. Open http://localhost:3000 — you'll see the Login page.
2. Click the **Register** tab.
3. Fill in Name, Email, Password (≥ 8 chars), Confirm Password and submit.
4. A success toast appears; you're redirected to the Login tab automatically.
5. Enter your email and password, click **Sign In**.
6. The Dashboard loads showing all 8 property listings.
7. Click **♡ Save** on any card — the button instantly turns red showing **♥ Saved** (optimistic update).
8. Scroll down to **My Favourites** — your saved property appears there too.

### Flow B: Login → Remove a Favourite → Logout

1. Open http://localhost:3000 and sign in.
2. In the **All Properties** section, find a card already showing **♥ Saved** (from a previous session).
3. Click **♥ Saved** — it immediately reverts to **♡ Save** and the property is removed from **My Favourites**.
4. Click **Logout** in the header — you're returned to the Login page and all local data is cleared.

---

## 4. API Reference

| Method | Route | Auth? | Description |
|--------|-------|-------|-------------|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Login, returns JWT |
| `GET` | `/api/properties` | Yes | List all properties |
| `GET` | `/api/favourites` | Yes | List current user's favourites |
| `POST` | `/api/favourites/:propertyId` | Yes | Add a property to favourites |
| `DELETE` | `/api/favourites/:propertyId` | Yes | Remove a property from favourites |

**Authentication**: All protected routes require `Authorization: Bearer <token>` in the request header.

**Error format**: All error responses use `{ "error": "message" }` with an appropriate HTTP status code.

---

## 5. Known Limitations & Assumptions

- **JWT expiry**: Access tokens expire in 15 minutes. There is no refresh-token mechanism — the user will need to log in again after expiry. The frontend will automatically redirect to the login page on a 401 response.
- **No pagination**: All properties are returned in a single response. This is acceptable for a seed set of 8 listings but would need pagination for a real production database.
- **SQLite concurrency**: `better-sqlite3` is synchronous and single-file, ideal for development and low-traffic deployments. For high-concurrency production use, switch to PostgreSQL.
- **Image URLs**: Property images are sourced from Unsplash via direct URL. In production, images should be hosted on a CDN.
- **Frontend served by Express**: The client is served as static files by the same Express process. A separate CDN or Nginx layer would be recommended for production.
- **TypeScript**: The backend is written in TypeScript compiled on-the-fly via `ts-node-dev`. Run `npm run build` to produce a compiled `dist/` folder for production.
