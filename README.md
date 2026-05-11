# Kidzvi - Child Activity, Reward Monitoring and Parental Control Platform

Kidzvi is a MERN-stack web application designed to help parents manage children's activities, assign meaningful tasks, approve completions, track progress, and manage rewards. The project focuses on replacing passive screen time with structured learning, creativity, responsibility, physical activities, and parent-approved rewards.

This project was developed as a full-stack college project with a strong backend focus, including REST API design, authentication, authorization, database modelling, input validation, and secure parent-child data ownership checks.

## Table of Contents

- [Project Overview](#project-overview)
- [Backend Highlights](#backend-highlights)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Architecture](#backend-architecture)
- [Database Models](#database-models)
- [API Routes](#api-routes)
- [User Roles](#user-roles)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Google Login Setup](#google-login-setup)
- [Security Features](#security-features)
- [Verification](#verification)

## Project Overview

Kidzvi allows parents to create child profiles, assign activities, approve completed tasks, award points, and configure reward systems. Children use a parent-managed dashboard to view missions, submit completions, track points, and claim rewards.

Core workflow:

1. Parent registers or logs in.
2. Parent creates child profiles.
3. Parent assigns activities to a child.
4. Child opens the child dashboard and submits completed missions.
5. Parent approves or rejects the submitted activity.
6. Approved activities award points and contribute to progress reports.

## Backend Highlights

The backend is the main system layer of this project. It handles authentication, authorization, database operations, business logic, validation, activity assignment, approval workflow, reward claims, and reports.

Key backend features:

- REST API built with Node.js and Express.js.
- MongoDB database integration using Mongoose.
- JWT-based authentication.
- Password hashing using bcryptjs.
- Google login support using Google Identity Services ID token verification.
- Role-based route protection for Parent and Admin access.
- Parent ownership checks to prevent unauthorized access to child data.
- Activity assignment lifecycle from assigned to submitted to approved or rejected.
- Reward creation, claiming, approval, rejection, and completion workflow.
- Reporting endpoints for summaries, weekly activity, category distribution, and reward history.
- Express-validator based request validation.
- Helmet, CORS, rate limiting, and structured error handling.
- Health endpoint with database connection status.

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| MongoDB | NoSQL database |
| Mongoose | ODM and schema modelling |
| JSON Web Token | Authentication |
| bcryptjs | Password hashing |
| Google Auth Library | Google login token verification |
| Express Validator | Request validation |
| Helmet | Security headers |
| CORS | Frontend-backend communication |
| Express Rate Limit | API abuse protection |
| Morgan | HTTP request logging |

### Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development server and build tool |
| React Router DOM | Client-side routing |
| Tailwind CSS | Styling |
| Axios | API communication |
| React Hook Form | Form management |
| Zod | Frontend validation |
| Recharts | Charts and reports |
| Framer Motion | UI animation |

## Project Structure

```text
GP/
├── server/
│   ├── src/
│   │   ├── config/              # Database configuration
│   │   ├── controllers/         # Backend business logic
│   │   ├── middleware/          # Auth, role, validation and error middleware
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # Express route definitions
│   │   ├── utils/               # Token, badge, points and helper logic
│   │   └── app.js               # Express app setup
│   ├── server.js                # Backend entry point
│   ├── package.json
│   └── .env.example
│
├── client/
│   ├── src/
│   │   ├── api/                 # Axios API functions
│   │   ├── components/          # Shared UI components
│   │   ├── context/             # Authentication context
│   │   ├── layouts/             # Parent, child and admin layouts
│   │   ├── pages/               # Application pages
│   │   ├── routes/              # Route protection and route config
│   │   └── utils/               # Frontend helpers and constants
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## Backend Architecture

The backend follows a modular Express architecture:

| Layer | Responsibility |
|---|---|
| Routes | Define API endpoints and attach middleware |
| Middleware | Authentication, role checks, request validation, error handling |
| Controllers | Execute business logic and send responses |
| Models | Define MongoDB schemas and relationships |
| Utilities | Token generation, point calculation, badge awarding and helpers |
| Config | Database connection setup |

Important backend files:

| File | Purpose |
|---|---|
| `server/server.js` | Starts the Express server and connects MongoDB |
| `server/src/app.js` | Registers middleware, routes, health checks and error handlers |
| `server/src/config/db.js` | Handles MongoDB connection |
| `server/src/middleware/authMiddleware.js` | Verifies JWT token and attaches current user |
| `server/src/middleware/roleMiddleware.js` | Restricts routes by user role |
| `server/src/middleware/validateRequest.js` | Returns validation errors from express-validator |
| `server/src/controllers/authController.js` | Registration, login, Google login and profile logic |
| `server/src/controllers/activityController.js` | Activity CRUD, assignment and child submission logic |
| `server/src/controllers/approvalController.js` | Parent approval and rejection workflow |
| `server/src/controllers/rewardController.js` | Reward and reward claim workflow |
| `server/src/controllers/reportController.js` | Reports and analytics endpoints |

## Database Models

| Model | Description |
|---|---|
| `User` | Parent and admin accounts, local or Google authentication |
| `Child` | Child profile linked to a parent account |
| `Activity` | Activity library item with category, age group, points and duration |
| `AssignedActivity` | Activity assigned to a child by a parent |
| `CompletedActivity` | Submitted activity waiting for approval or already reviewed |
| `Reward` | Parent-created reward that children can claim |
| `RewardClaim` | Child reward claim and parent approval status |
| `Badge` | Badge earned by a child based on activity milestones |
| `Notification` | System messages for parent workflow events |
| `ParentSettings` | Parental control settings for a child |

## API Routes

### Authentication - `/api/auth`

| Method | Route | Description |
|---|---|---|
| POST | `/register` | Register a parent account |
| POST | `/login` | Login using email and password |
| POST | `/google` | Login or register using Google |
| GET | `/me` | Get current authenticated user |
| POST | `/logout` | Logout acknowledgement |

### Parent - `/api/parents`

| Method | Route | Description |
|---|---|---|
| GET | `/dashboard` | Parent dashboard data |
| POST | `/children` | Create a child profile |
| GET | `/children` | List children owned by parent |
| GET | `/children/:childId` | Get child details |
| PUT | `/children/:childId` | Update child profile |
| DELETE | `/children/:childId` | Deactivate child profile |
| PUT | `/settings/:childId` | Update parental settings |

### Activities - `/api/activities`

| Method | Route | Description |
|---|---|---|
| GET | `/` | Browse activity library |
| POST | `/` | Create activity |
| GET | `/:id` | Get activity by ID |
| PUT | `/:id` | Update activity |
| DELETE | `/:id` | Deactivate activity |
| POST | `/assign` | Assign activity to child |
| GET | `/child/:childId` | Get assigned activities for child |
| POST | `/:assignedActivityId/submit` | Submit completed activity |

### Approvals - `/api/approvals`

| Method | Route | Description |
|---|---|---|
| GET | `/pending` | Get submitted activities waiting for review |
| PUT | `/activity/:completedActivityId/approve` | Approve and award points |
| PUT | `/activity/:completedActivityId/reject` | Reject submission |

### Rewards - `/api/rewards`

| Method | Route | Description |
|---|---|---|
| POST | `/` | Create reward |
| GET | `/:childId` | Get rewards for child |
| PUT | `/:rewardId` | Update reward |
| DELETE | `/:rewardId` | Delete reward |
| POST | `/:rewardId/claim` | Claim reward |
| GET | `/claims/pending` | Get pending reward claims |
| PUT | `/claims/:id/approve` | Approve reward claim |
| PUT | `/claims/:id/reject` | Reject reward claim |
| PUT | `/claims/:id/complete` | Mark reward as completed |

### Reports - `/api/reports`

| Method | Route | Description |
|---|---|---|
| GET | `/child/:id/summary` | Activity summary |
| GET | `/child/:id/weekly` | Weekly activity report |
| GET | `/child/:id/category-distribution` | Activity category distribution |
| GET | `/child/:id/rewards` | Reward history |

### Admin - `/api/admin`

| Method | Route | Description |
|---|---|---|
| GET | `/users` | List platform users |
| GET | `/activities` | List all activities |
| POST | `/activities` | Seed or create activities |
| PUT | `/activities/:id` | Update activity |
| DELETE | `/activities/:id` | Delete activity |
| GET | `/reports` | Platform analytics |

## User Roles

### Parent

- Registers and logs in using email/password or Google.
- Creates and manages child profiles.
- Assigns activities to children.
- Reviews submitted activity completions.
- Creates rewards and approves reward claims.
- Views child reports and progress analytics.
- Configures parental settings.

### Child

- Uses a parent-managed child dashboard.
- Views assigned missions.
- Submits completed activities.
- Tracks points, badges and rewards.

Current child access is parent-managed. Children do not currently have independent login accounts.

### Admin

- Manages users.
- Manages activity library content.
- Views platform-level reports.

## Setup Instructions

### Prerequisites

- Node.js v18 or newer
- npm
- MongoDB Atlas or local MongoDB

### Install Backend Dependencies

```bash
cd server
npm install
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Start Backend

```bash
cd server
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

### Start Frontend

```bash
cd client
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Environment Variables

### Backend - `server/.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/kidzvi
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_oauth_web_client_id.apps.googleusercontent.com
```

### Frontend - `client/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_web_client_id.apps.googleusercontent.com
```

Do not commit real `.env` files because they may contain secrets or database credentials.

## Google Login Setup

Google sign-in requires a Google OAuth Web Client ID.

Steps:

1. Open Google Cloud Console.
2. Create or select a project.
3. Go to APIs and Services.
4. Configure the OAuth consent screen.
5. Create OAuth Client ID credentials.
6. Choose application type: Web application.
7. Add authorized JavaScript origin:

```text
http://localhost:5173
```

8. Copy the generated client ID into both env files:

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

The backend uses `GOOGLE_CLIENT_ID` to verify the Google ID token. The frontend uses `VITE_GOOGLE_CLIENT_ID` to render the Google login button.

If `VITE_GOOGLE_CLIENT_ID` is missing, the Google button will not appear.

## How To Assign Activities

1. Login as a parent.
2. Go to `Children` and create a child profile.
3. Go to `Assign Activities`.
4. Select a child.
5. Select an activity from the activity list.
6. Optionally set a due date and note.
7. Click `Assign Activity`.

The child can view assigned tasks at:

```text
/child/:childId/dashboard
/child/:childId/missions
```

## Security Features

- JWT authentication.
- bcrypt password hashing.
- Google ID token verification on backend.
- Role-based route authorization.
- Parent ownership checks for child data.
- Request validation using express-validator.
- Helmet security headers.
- CORS configuration.
- Rate limiting for API and authentication routes.
- Password field removed from API responses.
- Database status exposed through `/health`.

## Verification

Frontend checks:

```bash
cd client
npm run lint
npm run build
```

Backend syntax/load check:

```bash
cd server
node -e "require('./src/app'); console.log('server app loaded')"
```

Health check:

```text
GET http://localhost:5000/health
```

## Conclusion

Kidzvi demonstrates a complete MERN-stack application with practical backend design, secure authentication, database relationships, protected APIs, parent-child data ownership, activity workflows, reward management, and reporting features suitable for an academic full-stack project.
