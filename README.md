# FitGenZ 🏋️‍♂️⚡

> **Real-time AI-powered fitness SaaS for Gen Z athletes**

A full-stack fitness platform with real-time WebSockets, gamification (XP/levels/leaderboard), AI coaching, smart dashboard, push notifications, and goal prediction — built for production.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | JWT access tokens + httpOnly refresh cookie, token rotation |
| 🤖 AI Coach | GPT-powered personalized fitness & diet chat |
| ⚡ Real-time | Socket.io — live XP, streak, task & progress updates |
| 🎮 Gamification | XP points, 10 levels (Rookie → God Mode), 9 badges |
| 🏆 Leaderboard | Global top-20 ranking by XP |
| 📊 Smart Dashboard | Weekly heatmap, goal progress %, weight chart |
| 🔮 Prediction | Linear regression → estimated goal completion date |
| 🔔 Push Notifications | Web Push API — streak alerts, level-ups, badge unlocks |
| 💪 Workouts | Personalized plans by gender/goal/level/category |
| 🥗 Diet | Indian budget-friendly meal plans |
| 📈 Progress | Weight & body fat tracking with trend chart |
| ✅ Daily Tasks | Auto-generated daily tasks with XP rewards |

---

## 🗂️ Project Structure

```
FitGenZ/
├── client/          # React 19 + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── context/     # AuthContext, SocketContext
│   │   ├── hooks/       # useNotifications
│   │   ├── pages/       # Dashboard, Workout, Diet, Progress, AI, Leaderboard
│   │   ├── components/  # Sidebar, BottomNav, NotificationBell, Skeleton
│   │   └── utils/       # axios instance with auto-refresh interceptor
│   └── public/
│       └── sw.js        # Service Worker for Web Push
│
└── server/          # Node.js + Express 5 + MongoDB
    ├── config/          # db, cache (Redis/NodeCache), socket (Socket.io)
    ├── controllers/     # auth, user, workout, diet, progress, task, ai,
    │                    # analytics, gamification, notification
    ├── middleware/       # auth, rateLimit, cache, xss, validate, error
    ├── models/          # User, UserStats, Progress, Task, Diet, Workout,
    │                    # Analytics, RefreshToken, Notification
    ├── routes/          # all route files
    ├── services/        # analytics, personalization, gamification, prediction
    └── utils/           # asyncHandler, pagination, tokenUtils, logger, ...
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key (optional — AI Coach feature)

### 1. Clone
```bash
git clone https://github.com/DURGESH103/FitGenZ.git
cd FitGenZ
```

### 2. Backend setup
```bash
cd server
cp .env.example .env        # fill in your values
npm install
npm run dev                 # starts on http://localhost:5000
```

### 3. Frontend setup
```bash
cd client
cp .env.example .env.local  # fill in VITE_VAPID_PUBLIC_KEY if using push
npm install
npm run dev                 # starts on http://localhost:5173
```

---

## 🔑 Environment Variables

### `server/.env`

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Access token signing secret |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token signing secret |
| `CORS_ORIGIN` | ✅ | Comma-separated allowed origins |
| `OPENAI_API_KEY` | ⚠️ | Required for AI Coach feature |
| `REDIS_URL` | ❌ | Optional — falls back to in-memory cache |
| `VAPID_PUBLIC_KEY` | ❌ | Optional — required for Web Push |
| `VAPID_PRIVATE_KEY` | ❌ | Optional — required for Web Push |

### `client/.env.local`

| Variable | Required | Description |
|---|---|---|
| `VITE_VAPID_PUBLIC_KEY` | ❌ | Must match server `VAPID_PUBLIC_KEY` |

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/refresh` | cookie | Refresh access token |
| POST | `/api/auth/logout` | — | Logout |
| GET | `/api/user/profile` | ✅ | Get profile |
| PUT | `/api/user/profile` | ✅ | Update profile |
| GET | `/api/workout` | — | Get workouts |
| GET | `/api/diet` | — | Get diet plan |
| GET/POST | `/api/progress` | ✅ | Progress history / log entry |
| GET/PATCH | `/api/task` | ✅ | Daily tasks / mark complete |
| GET | `/api/ai/recommend` | ✅ | AI recommendation |
| GET | `/api/analytics` | ✅ | Analytics + streak |
| GET | `/api/gamification/stats` | ✅ | XP, level, badges |
| GET | `/api/gamification/leaderboard` | ✅ | Top 20 leaderboard |
| GET | `/api/gamification/prediction` | ✅ | Goal completion prediction |
| GET | `/api/notifications` | ✅ | Notification list |
| PATCH | `/api/notifications/read-all` | ✅ | Mark all read |
| POST | `/api/notifications/push` | ✅ | Save push subscription |

---

## 🔴 Real-time Socket Events

Connect with: `io(origin, { auth: { token: accessToken } })`

| Event (server → client) | Payload | Trigger |
|---|---|---|
| `stats:update` | `{ xp, level, levelTitle, streak, xpGain, leveledUp, newBadges }` | Task completed |
| `task:updated` | `{ task, streak }` | Task completed |
| `progress:new` | `{ entry, xpGain, xp, level }` | Progress logged |

---

## 🎮 Gamification

### XP Rewards
| Action | XP |
|---|---|
| Task complete | +20 |
| All tasks done | +50 |
| Progress logged | +30 |
| Workout logged | +40 |
| Streak milestone | +100 |

### Levels
| Level | Title | XP Required |
|---|---|---|
| 1 | Rookie | 0 |
| 2 | Challenger | 100 |
| 3 | Athlete | 300 |
| 4 | Warrior | 600 |
| 5 | Champion | 1,000 |
| 6 | Legend | 1,500 |
| 7 | Elite | 2,200 |
| 8 | Master | 3,000 |
| 9 | Grandmaster | 4,000 |
| 10 | God Mode | 5,500 |

---

## 🛠️ Tech Stack

**Frontend:** React 19, Vite 8, Tailwind CSS v4, Framer Motion, Recharts, Socket.io-client, Axios, React Router v7

**Backend:** Node.js, Express 5, MongoDB + Mongoose, Socket.io, JWT, bcryptjs, Redis (optional), Winston, Morgan

---

## 📄 License

MIT
