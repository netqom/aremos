# AREMOS Backend

AREMOS Backend is a modern REST API for the AREMOS learning platform with integrated AREMOS algorithm, authentication, and classroom management.

## 🚀 Tech Stack

- **Fastify** (High-Performance Node.js Framework)
- **TypeScript** for Type Safety
- **Prisma ORM** for Database Management
- **PostgreSQL** as Database
- **JWT** for Authentication
- **Supabase Storage** for File Uploads
- **bcryptjs** for Password Hashing

## 📁 Project Structure

```
aremos_backend_final/
├── src/
│   ├── controllers/       # Route Handlers
│   │   ├── auth.controller.ts
│   │   ├── deck.controller.ts
│   │   ├── classroom.controller.ts
│   │   ├── practice.controller.ts
│   │   ├── uploads.controller.ts
│   │   ├── insights.controller.ts
│   │   └── notification.controller.ts
│   ├── routes/           # API Routes
│   ├── plugins/          # Fastify Plugins
│   │   ├── auth-hardening.ts
│   │   ├── rate-limit.ts
│   │   └── jwt-blacklist.ts
│   ├── services/         # Business Logic
│   │   ├── aremos.engine.ts
│   │   └── practice.session-store.ts
│   ├── schemas/          # Validation Schemas
│   ├── storage/          # File Storage Adapters
│   ├── cron/            # Scheduled Tasks
│   └── utils/           # Utilities
├── prisma/
│   ├── schema.prisma    # Database Schema
│   └── migrations/      # Database Migrations
└── tsconfig.json
```

## 🛠️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env
```

Fill the `.env` with your values:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/aremos"

# Auth
JWT_SECRET="your-super-secret-jwt-key"
LICENSE_CODE="1185131519"

# Server
PORT=3000
FRONTEND_ORIGIN="http://localhost:3001"

# Storage (Supabase)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-supabase-anon-key"
SUPABASE_BUCKET="card-images"
```

### 3. Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Run Migrations
npx prisma migrate deploy

# Optional: View Database
npx prisma studio
```

### 4. Development Server
```bash
npm run dev
```

API runs on [http://localhost:3000](http://localhost:3000)

## 🔧 Production Deployment

```bash
# Build
npm run build

# Start Production Server
npm start
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User Registration
- `POST /api/auth/login` - User Login
- `POST /api/auth/logout` - Logout
- `DELETE /api/auth/account` - Delete Account

### Decks
- `GET /api/decks` - List User Decks
- `POST /api/decks` - Create Deck
- `GET /api/decks/:id` - Get Deck Details
- `PUT /api/decks/:id` - Update Deck
- `DELETE /api/decks/:id` - Delete Deck
- `POST /api/decks/:id/create-version` - Create Deck Version

### Cards
- `POST /api/decks/:deckId/cards` - Add Card to Deck
- `PUT /api/decks/:deckId/cards/:cardId` - Update Card
- `DELETE /api/decks/:deckId/cards/:cardId` - Delete Card

### Practice Sessions
- `POST /api/practice/sessions` - Start Practice Session
- `GET /api/practice/sessions/:id` - Get Session Status
- `POST /api/practice/sessions/:id/answer` - Submit Answer
- `POST /api/practice/sessions/:id/end` - End Session

### Classrooms
- `GET /api/classrooms` - List Classrooms
- `POST /api/classrooms` - Create Classroom
- `GET /api/classrooms/:id` - Get Classroom
- `POST /api/classrooms/:id/members` - Add Member
- `DELETE /api/classrooms/:id/members/:userId` - Remove Member

### File Uploads
- `POST /api/uploads/decks/:deckId/cards/:cardId/image` - Upload Card Image
- `DELETE /api/uploads/decks/:deckId/cards/:cardId/image` - Delete Card Image

### Insights & Notifications
- `GET /api/insights/:deckId` - Get Deck Insights
- `GET /api/notifications` - Get User Notifications

## 🔐 Security Features

### Authentication & Authorization
- **JWT-based** Authentication
- **bcrypt** Password Hashing (Cost Factor 12)
- **Token Versioning** for Logout-All Functionality
- **JTI Blacklist** for Token Revocation

### Rate Limiting
- **150 requests/minute** per IP
- **Login Protection**: 10 attempts → 10min lock
- **Endpoint-specific** Rate Limits

### Input Validation
- **Joi Schemas** for Request Validation
- **SQL Injection** Protection via Prisma
- **XSS Protection** through Input Sanitization

### CORS & Headers
- **Strict CORS** Policy
- **Security Headers** (CSRF, etc.)
- **Environment-based** Origin Control

## 🗄️ Database Schema

### Core Models
- **Users**: Authentication & Profiles
- **Decks**: Card stacks with metadata
- **Cards**: Individual learning cards
- **Classrooms**: Group Management
- **Practice Sessions**: Learning Sessions
- **Card Interactions**: Performance Tracking

### Key Features
- **Soft Deletes** for important entities
- **Timestamps** (createdAt, updatedAt)
- **Foreign Key Constraints**
- **Indexing** for Performance

## 🎯 AREMOS Algorithm

The AREMOS algorithm is implemented in `aremos.engine.ts`:

1. **Each card** must be answered correctly 2 times
2. **Correct answer**: Card goes to end of round
3. **Wrong answer**: Card goes before already correct cards
4. **Session end**: All cards answered correctly 2 times

## 📊 Monitoring & Logging

- **Structured Logging** with Fastify Logger
- **Error Tracking** with Stack Traces
- **Performance Metrics** via Fastify Stats
- **Health Check** Endpoint: `/api/health`

## 🔄 Cron Jobs

- **SR Notifications**: Daily 12:30 (Europe/Berlin)
- **Insights Cleanup**: Daily (7-day retention)
- **Inactivity Cleanup**: Daily (365-day inactivity)

## 🚀 Performance

- **Connection Pooling** (Prisma)
- **Query Optimization** with indices
- **Caching Strategy** (In-Memory for Sessions)
- **Compression** (gzip)

---

**Developed for AREMOS Learning Platform**
