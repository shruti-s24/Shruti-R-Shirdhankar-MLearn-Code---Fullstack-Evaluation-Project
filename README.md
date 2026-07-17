# Shruti-R-Shirdhankar-MLearn-Code---Fullstack-Evaluation-Project
## Live Demo

- **Frontend:** https://shruti-r-shirdhankar-m-learn-code-f.vercel.app
- **Backend API:** https://shruti-r-shirdhankar-mlearn-code.onrender.com/api

## Test Credentials

**Admin**
- Email: `admin@test.com`
- Password: `admin123`

**Agent**
- Create an agent account by logging in as Admin above and using "Create Agent".
- OR
- Email: `agent2@test.com`
- Password: `password123`

> **Note:** the backend is hosted on Render's free tier, which spins down after 15 minutes of inactivity.Kindly wait after the first request.


## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm
- A MongoDB Atlas cluster (or local MongoDB instance)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in real values — see Environment Variables below
npm run dev             # starts the dev server with ts-node-dev/nodemon
```

The backend runs on `http://localhost:8000` by default (or whatever `PORT` is set to).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL — see Environment Variables below
npm run dev
```

The frontend runs on `http://localhost:5173` by default (Vite's default port).

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the Express server listens on | `8000` |
| `MONGO_URI` | MongoDB Atlas (or local) connection string, including database name | `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/insurance-policy-db?retryWrites=true&w=majority` |
| `COOKIE_SECRET` | Secret used to sign session JWTs | a long random string |
| `COOKIE_EXPIRY_MINS` | Session/cookie expiry, in minutes | `15` |
| `FRONTEND_URL` | The deployed frontend's origin, used for CORS | `https://your-frontend.vercel.app` |
| `NODE_ENV` | `development` locally, `production` when deployed — controls cookie `secure`/`sameSite` behavior | `development` |

## Running Tests

```bash
cd backend
npm test
```

