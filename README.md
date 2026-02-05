# 🌸 DailyBloom

A beautiful, modern wellness companion app for journaling, habit tracking, mood monitoring, and personal growth.

![DailyBloom](https://img.shields.io/badge/DailyBloom-Wellness%20App-8b5cf6?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

### 📓 Journal
- Rich text editor with formatting options
- Date-organized entries
- Search and filter functionality
- Automatic saving

### ✅ Habit Tracker
- Create and manage daily habits
- Visual progress tracking with checkmarks
- Streak counting
- Historical habit data

### 😊 Mood Tracker
- Log your daily mood with notes
- Visual mood chart (last 14 days)
- Mood history with relative timestamps
- Pattern recognition

### 📅 Calendar
- View all activities by date
- Event visualization
- Quick navigation

### 📊 Dashboard
- Overview of all activities
- Today's stats at a glance
- Quick actions
- Mood and habit summaries

---

## 🏗️ Project Structure

```
dailybloom/
├── frontend/                    # React + Vite frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── assets/              # Images, icons
│   │   ├── components/          # Reusable UI components
│   │   │   ├── AppLayout.jsx    # Main layout wrapper
│   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   ├── RichTextEditor.jsx
│   │   │   ├── AuthPrompt.jsx
│   │   │   ├── DriveAuthModal.jsx
│   │   │   └── MobileSidebarToggle.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Authentication state
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  # Public homepage
│   │   │   ├── Login.jsx        # Authentication
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── Journal.jsx      # Journal entries
│   │   │   ├── HabitTracker.jsx # Habit management
│   │   │   ├── MoodTracker.jsx  # Mood logging
│   │   │   └── Calendar.jsx     # Calendar view
│   │   ├── services/
│   │   │   ├── api.js           # API client
│   │   │   └── googleDriveService.js
│   │   ├── styles/              # Component CSS files
│   │   │   ├── theme.css        # Design system tokens
│   │   │   ├── Dashboard.css
│   │   │   ├── Journal.css
│   │   │   ├── HabitTracker.css
│   │   │   ├── MoodTracker.css
│   │   │   ├── Calendar.css
│   │   │   ├── Sidebar.css
│   │   │   └── ...
│   │   ├── App.jsx              # Root component
│   │   ├── App.css              # Global styles
│   │   └── main.jsx             # Entry point
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Node.js + Express API
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.js              # Sample data seeder
│   │   └── migrations/          # Database migrations
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js      # Supabase client
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT authentication
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.js          # Auth endpoints
│   │   │   ├── journal.js       # Journal CRUD
│   │   │   ├── habits.js        # Habits CRUD
│   │   │   └── mood.js          # Mood CRUD
│   │   ├── services/
│   │   │   └── authService.js   # Auth business logic
│   │   ├── validators/          # Request validation
│   │   └── index.js             # Server entry
│   ├── .env                     # Environment variables
│   └── package.json
│
└── README.md                    # This file
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router** | Client-side routing |
| **React Icons** | Icon library |
| **CSS Variables** | Design system |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express** | Web framework |
| **Prisma** | Database ORM |
| **Supabase** | PostgreSQL + Auth |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |

### Database Schema
```
┌─────────────┐     ┌─────────────┐
│    User     │────<│   Journal   │
├─────────────┤     ├─────────────┤
│ id          │     │ id          │
│ email       │     │ title       │
│ password    │     │ content     │
│ name        │     │ date        │
│ googleId    │     │ userId (FK) │
└─────────────┘     └─────────────┘
       │
       │            ┌─────────────┐
       ├───────────<│   Habit     │
       │            ├─────────────┤
       │            │ id          │
       │            │ name        │
       │            │ userId (FK) │
       │            └──────┬──────┘
       │                   │
       │            ┌──────┴──────┐
       │            │HabitProgress│
       │            ├─────────────┤
       │            │ id          │
       │            │ habitId(FK) │
       │            │ date        │
       │            │ completed   │
       │            └─────────────┘
       │
       │            ┌─────────────┐
       └───────────<│ MoodEntry   │
                    ├─────────────┤
                    │ id          │
                    │ mood        │
                    │ note        │
                    │ date        │
                    │ userId (FK) │
                    └─────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- Supabase account (for database)
- Google Cloud Console project (for OAuth - optional)

### 1. Clone the repository
```bash
git clone https://github.com/SHUBHI-KUMARI/DailyBloom.git
cd DailyBloom
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials:
# - DATABASE_URL (Supabase PostgreSQL connection string)
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - JWT_SECRET
# - GOOGLE_CLIENT_ID (optional)

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with demo data
npm run db:seed

# Start the server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your API URL:
# - VITE_API_URL=http://localhost:3000/api
# - VITE_GOOGLE_CLIENT_ID (optional)

# Start the development server
npm run dev
```

### 4. Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## 🎭 Demo Accounts

After running `npm run db:seed` in the backend, you can log in with these demo accounts:

| Email | Password | Persona |
|-------|----------|---------|
| sarah@demo.com | Demo@123 | **Consistent Achiever** - High habit consistency, positive mood patterns |
| alex@demo.com | Demo@123 | **Recovering Procrastinator** - Improving over time, variable moods |
| maya@demo.com | Demo@123 | **Creative Explorer** - Creative bursts, artistic focus |

---

## 📜 Available Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend
```bash
npm run dev         # Start with nodemon (hot reload)
npm run start       # Start production server
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:migrate  # Run migrations
npm run db:studio   # Open Prisma Studio
npm run db:seed     # Seed demo data
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/google` | Login with Google OAuth |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Journal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/journal` | Get all entries |
| GET | `/api/journal/:id` | Get single entry |
| POST | `/api/journal` | Create entry |
| PUT | `/api/journal/:id` | Update entry |
| DELETE | `/api/journal/:id` | Delete entry |

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | Get all habits with progress |
| POST | `/api/habits` | Create habit |
| PUT | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Delete habit |
| POST | `/api/habits/:id/progress` | Toggle progress for date |

### Mood
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mood` | Get all mood entries |
| POST | `/api/mood` | Create mood entry |
| DELETE | `/api/mood/:id` | Delete mood entry |

---

## 🎨 Design System

DailyBloom uses a comprehensive design system with CSS variables:

### Colors
- **Primary**: Violet/Purple (`#8b5cf6`)
- **Mood Colors**: Great (green), Good (teal), Neutral (amber), Bad (orange), Awful (red)
- **Neutral Palette**: Slate grays for text and backgrounds

### Typography
- **Font**: System font stack
- **Scale**: 12px - 48px

### Spacing
- **Scale**: 4px base unit (4, 8, 12, 16, 20, 24, 32, 40, 48, 64)

### Components
- Cards with rounded corners and subtle shadows
- Consistent button styles
- Form inputs with focus states
- Responsive sidebar with collapse

---

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set start command: `npm start`
3. Add environment variables
4. Configure PostgreSQL (or use Supabase)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 💜 Acknowledgments

- Icons by [React Icons](https://react-icons.github.io/react-icons/)
- Database by [Supabase](https://supabase.com/)
- Inspired by wellness and productivity apps

---

<p align="center">
  Made with 💜 by <a href="https://github.com/SHUBHI-KUMARI">Shubhi Kumari</a>
</p>
