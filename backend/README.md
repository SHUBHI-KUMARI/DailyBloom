# DailyBloom Backend

Backend API for DailyBloom - Journal & Habit Tracker application.

## Tech Stack

- **Node.js** + **Express** - Server framework
- **Prisma** - Database ORM
- **Supabase** - PostgreSQL database & storage
- **JWT** - Authentication

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Supabase account

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your Supabase credentials:
   - `DATABASE_URL` - Your Supabase PostgreSQL connection string
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
   - `JWT_SECRET` - A strong secret for JWT signing

4. Generate Prisma client:
```bash
npm run db:generate
```

5. Push database schema to Supabase:
```bash
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

The server will start at `http://localhost:3001`.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/google` | Login/register with Google |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (revoke refresh token) |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Journals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/journals` | Get all journal entries |
| GET | `/api/journals/:id` | Get a journal entry |
| POST | `/api/journals` | Create a journal entry |
| PUT | `/api/journals/:id` | Update a journal entry |
| DELETE | `/api/journals/:id` | Delete a journal entry |

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | Get all habits |
| GET | `/api/habits/:id` | Get a habit |
| GET | `/api/habits/stats` | Get habit statistics |
| POST | `/api/habits` | Create a habit |
| PUT | `/api/habits/:id` | Update a habit |
| DELETE | `/api/habits/:id` | Delete a habit |
| POST | `/api/habits/:id/toggle` | Toggle habit for a date |
| PUT | `/api/habits/:id/progress` | Bulk update progress |

### Moods

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/moods` | Get all mood entries |
| GET | `/api/moods/:id` | Get a mood entry |
| GET | `/api/moods/stats` | Get mood statistics |
| GET | `/api/moods/calendar` | Get all data for calendar |
| POST | `/api/moods` | Create a mood entry |
| PUT | `/api/moods/:id` | Update a mood entry |
| DELETE | `/api/moods/:id` | Delete a mood entry |

## Database Schema

The database uses PostgreSQL with the following models:

- **User** - User accounts (email/password or Google OAuth)
- **RefreshToken** - JWT refresh tokens for session management
- **Journal** - Journal entries
- **Habit** - Habit definitions
- **HabitProgress** - Daily habit completion tracking
- **MoodEntry** - Mood log entries

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3001) |
| `NODE_ENV` | Environment (development/production) |
| `DATABASE_URL` | PostgreSQL connection string |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `JWT_SECRET` | Secret for JWT signing |
| `JWT_EXPIRES_IN` | JWT expiration time (default: 7d) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration (default: 30d) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `FRONTEND_URL` | Frontend URL for CORS (default: http://localhost:5173) |
