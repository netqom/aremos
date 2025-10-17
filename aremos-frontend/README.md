# AREMOS Frontend

AREMOS is a modern learning platform for digital flashcards with integrated spaced repetition algorithm.

## 🚀 Tech Stack

- **Next.js 15** (React 19 + TypeScript)
- **TailwindCSS** for Styling
- **Radix UI** for UI Components
- **SWR** for Data Fetching
- **Lucide React** for Icons

## 📁 Project Structure

```
aremos/
├── app/                    # Next.js App Router
│   ├── classrooms/        # Classroom Management
│   ├── dashboard/         # User Dashboard
│   ├── decks/            # Deck Management & Practice
│   ├── login/            # Authentication
│   └── register/         # Registration (redirects to login)
├── components/           # Reusable Components
│   └── ui/              # Radix UI Components
├── lib/                 # Utilities & Helpers
│   ├── api.ts           # API Client
│   ├── notifications.ts # Notification System
│   └── timezone.ts      # Timezone Utilities
├── public/              # Static Assets
└── middleware.ts        # Route Protection
```

## 🛠️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
```

Fill the `.env.local` with your values:
```env
NEXT_PUBLIC_API_BASE=http://localhost:3000
NEXT_PUBLIC_TOKEN_KEY=aremos_token
```

### 3. Start Development Server
```bash
npm run dev
```

The app runs on [http://localhost:3001](http://localhost:3001)

## 🔧 Production Build

```bash
npm run build
npm start
```

## 📋 Features

### ✅ Implemented
- **Authentication**: Login/Register with JWT
- **Dashboard**: Overview of Decks and Notifications
- **Deck Management**: CRUD operations for Decks
- **Card Management**: Create, edit, delete cards
- **Practice Mode**: AREMOS algorithm for flashcards
- **Classroom System**: Group Management
- **Notifications**: Notification system
- **Insights**: Performance tracking (dummy data)
- **Responsive Design**: Mobile-friendly UI

### 🚧 TODO (Backend Integration)
- API integration for all functions
- Real database connection
- File upload for card images
- Real-time notifications
- Performance optimizations

## 🎨 Design System

### Colors
- **Primary**: `#121A4C` (Dark Blue)
- **Secondary**: `#4176A4` (Medium Blue)  
- **Accent**: `#6FA9D2` (Light Blue)
- **Background**: `#ECF7FB` (Very Light Blue)

### Components
- All UI components based on **Radix UI**
- **TailwindCSS** for consistent styling
- **Lucide React** icons for unified iconography

## 🔐 Authentication

- **JWT-based** authentication
- **Route Protection** via Middleware
- **Token Storage** in HTTP-only Cookies
- **Automatic Redirect** to login when auth is missing

## 🌍 Internationalization

- **German** as primary language
- **Europe/Berlin** timezone
- German date and time formats

## 📱 Mobile Support

- **Responsive Design** for all screen sizes
- **Touch-friendly** interface
- **Mobile-first** approach

---

**Developed for AREMOS Learning Platform**
