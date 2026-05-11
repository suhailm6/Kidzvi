# 🌟 Kidzvi — Child Activity, Reward Monitoring & Parental Control Platform

> **Kidzvi** is a MERN-stack child engagement platform that helps parents replace passive screen consumption with structured, age-appropriate learning, creativity, physical activities, responsibility tasks, and healthy reward monitoring.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Routes](#api-routes)
- [User Roles](#user-roles)
- [Features](#features)
- [Seed Data](#seed-data)

---

## 🎯 Project Overview

Kidzvi solves a real problem: children spending excessive time on passive, low-quality digital content. Instead of just blocking content, Kidzvi **replaces** it with meaningful, structured activities.

### Key Principles:
- ✅ Time-boxed activities (no infinite scroll)
- ✅ Parent-approved rewards
- ✅ Age-appropriate content (3-5, 6-8, 9-12)
- ✅ Progress tracking & analytics
- ✅ Child safety by design (no public profiles, no ads)

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT + bcryptjs | Authentication & security |
| Helmet + CORS | Security headers |
| Express Rate Limit | API protection |
| Morgan | HTTP logging |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework & build tool |
| React Router DOM | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Axios | HTTP requests |
| React Hook Form + Zod | Form handling & validation |
| Recharts | Charts & analytics |
| Framer Motion | Animations |

---

## 📁 Project Structure

```
GP/
├── server/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/db.js       # MongoDB connection
│   │   ├── controllers/       # Business logic (8 controllers)
│   │   ├── middleware/        # Auth, role, error handlers
│   │   ├── models/            # Mongoose models (10 models)
│   │   ├── routes/            # API routes (8 route files)
│   │   ├── utils/             # Helpers & engines
│   │   └── app.js             # Express app setup
│   ├── .env                   # Environment variables
│   └── server.js              # Entry point
│
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/               # Axios API layer (5 files)
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth context
│   │   ├── layouts/           # Parent/Child/Admin layouts
│   │   ├── pages/             # All 18 pages
│   │   ├── routes/            # Route config & protection
│   │   └── utils/             # Constants & helpers
│   └── .env                   # Frontend env vars
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ 
- MongoDB (local or Atlas)
- npm v8+

### 1. Clone the repository

```bash
git clone <repo-url>
cd GP
```

### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

---

## 🔐 Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kidzvi
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## ▶️ Running the App

### Start Backend (Terminal 1)
```bash
cd server
npm run dev
```
Server starts at: `http://localhost:5000`

### Start Frontend (Terminal 2)
```bash
cd client
npm run dev
```
App opens at: `http://localhost:5173`

---

## 🗺 API Routes

### Authentication (`/api/auth`)
| Method | Route | Description |
|---|---|---|
| POST | `/register` | Register a new parent |
| POST | `/login` | Login and get JWT |
| GET | `/me` | Get current user |
| POST | `/logout` | Logout |

### Parent (`/api/parents`)
| Method | Route | Description |
|---|---|---|
| GET | `/dashboard` | Parent dashboard stats |
| POST | `/children` | Create child profile |
| GET | `/children` | List all children |
| GET | `/children/:childId` | Get child details |
| PUT | `/children/:childId` | Update child |
| DELETE | `/children/:childId` | Deactivate child |
| GET | `/reports/:childId` | Child progress report |
| PUT | `/settings/:childId` | Update parental controls |

### Activities (`/api/activities`)
| Method | Route | Description |
|---|---|---|
| GET | `/` | Browse activity library |
| POST | `/` | Create activity |
| GET | `/:id` | Get activity |
| PUT | `/:id` | Update activity |
| DELETE | `/:id` | Delete activity |
| POST | `/assign` | Assign to child |
| GET | `/child/:childId` | Child's activities |
| POST | `/:assignedId/submit` | Submit completion |

### Approvals (`/api/approvals`)
| Method | Route | Description |
|---|---|---|
| GET | `/pending` | Pending approvals |
| PUT | `/activity/:id/approve` | Approve + award points |
| PUT | `/activity/:id/reject` | Reject activity |

### Rewards (`/api/rewards`)
| Method | Route | Description |
|---|---|---|
| POST | `/` | Create reward |
| GET | `/:childId` | Rewards for child |
| PUT | `/:rewardId` | Update reward |
| DELETE | `/:rewardId` | Delete reward |
| POST | `/:rewardId/claim` | Claim reward |
| GET | `/claims/pending` | Pending claims |
| PUT | `/claims/:id/approve` | Approve claim |
| PUT | `/claims/:id/reject` | Reject claim |
| PUT | `/claims/:id/complete` | Mark complete |

### Reports (`/api/reports`)
| Method | Route | Description |
|---|---|---|
| GET | `/child/:id/summary` | Summary stats |
| GET | `/child/:id/weekly` | Weekly activity data |
| GET | `/child/:id/category-distribution` | Category breakdown |
| GET | `/child/:id/rewards` | Reward history |

### Admin (`/api/admin`)
| Method | Route | Description |
|---|---|---|
| GET | `/users` | All platform users |
| GET | `/activities` | All activities |
| POST | `/activities` | Seed/create activity |
| PUT | `/activities/:id` | Edit activity |
| DELETE | `/activities/:id` | Delete activity |
| GET | `/reports` | Platform analytics |

---

## 👥 User Roles

### 🔵 Parent
- Register and login independently
- Create and manage child profiles
- Browse activity library
- Assign activities to children
- Approve/reject completed activities
- Create rewards and approve claims
- View progress charts and reports
- Configure parental controls per child

### 🟡 Child
- Access dashboard via parent-managed profile
- View assigned missions
- Submit activity completions with notes
- Track points and badges
- Browse and claim rewards

### 🔴 Admin
- Full activity library management (CRUD)
- Platform user management
- Seed initial activity content
- View platform-wide reports

---

## 🌱 Seed Data

The admin can seed 4 starter activities:
1. **Read a Short Story** (LANGUAGE, 6-8, 20 pts)
2. **Draw Your Dream Animal** (CREATIVITY, 6-8, 25 pts)
3. **20 Jumping Jacks** (PHYSICAL_ACTIVITY, 6-8, 15 pts)
4. **Clean Your Study Table** (RESPONSIBILITY, 6-8, 20 pts)

Hit `POST /api/admin/activities/seed` to load them.

---

## 🏅 Badge System

Badges are automatically awarded when:
- 🎨 **Creative Star** — 5 Creativity activities
- 📚 **Bookworm** — 5 Language activities
- 🏃 **Active Kid** — 5 Physical activities
- 🧹 **Responsibility Hero** — 5 Responsibility activities
- 🧠 **Brain Trainer** — 5 Math/Logic activities
- 💖 **Empathy Star** — 3 Emotional Intelligence activities
- 🌟 **First Mission** — Complete 1 activity
- 🔟 **Activity Pro** — Complete 10 activities
- 🏆 **Activity Master** — Complete 25 activities
- 💎 **Points Champion** — Earn 500 points
- 🔥 **Unstoppable** — Earn 1000 points

---

## 🛡 Security Features

- JWT authentication with 7-day expiry
- Password hashing (bcrypt, 12 rounds)
- Role-based route protection
- Parent ownership checks on all child data
- Rate limiting (100 req/15min global, 10/15min on auth)
- Helmet security headers
- Input validation via express-validator
- No passwords in API responses
- CORS restricted to frontend origin

---

## 📊 Development Phases

| Phase | Status | Description |
|---|---|---|
| 1 | ✅ | Planning & Setup |
| 2 | ✅ | Authentication |
| 3 | ✅ | Child Profile Management |
| 4 | ✅ | Activity Library |
| 5 | ✅ | Activity Assignment & Completion |
| 6 | ✅ | Reward System |
| 7 | ✅ | Reports & Charts |
| 8 | ✅ | UI Polish & Safety Review |

---

*Built with ❤️ for Kidzvi — helping children grow through meaningful activities.*
