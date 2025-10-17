# AREMOS

A modern learning platform for digital flashcards with integrated spaced repetition algorithm.

## 🚀 Features

- **Digital Flashcards** with text and image support
- **AREMOS Algorithm** for optimal learning
- **Spaced Repetition** planning
- **Classroom Management** for group learning
- **Learning Insights** for progress tracking
- **Responsive Design** for all devices

## 🛠 Tech Stack

### Frontend
- **Next.js 15** (React + TypeScript)
- **TailwindCSS** for styling
- **App Router** with middleware
- **Custom API client** for data fetching

### Backend
- **Node.js** with **Fastify**
- **Prisma ORM** for database access
- **PostgreSQL** database
- **JWT** authentication (2h validity)
- **bcrypt** for password hashing

### Storage
- **Supabase Storage** for images
- Supported formats: JPG, PNG, WebP (max. 10MB)

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- Supabase account (for storage)

### 1. Clone Repository
```bash
git clone https://github.com/[username]/aremos.git
cd aremos
```

### 2. Backend Setup
```bash
cd aremos-backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill .env file with your values

# Prisma setup
npm run generate
npm run migrate:dev

# Start backend
npm run dev
```

### 3. Frontend Setup
```bash
cd aremos-frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Configure .env.local with backend URL

# Start frontend
npm run dev
```

### 4. Access
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Prisma Studio: `npm run db:studio` (in backend folder)

## 🔧 Configuration

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aremos_db

# Supabase Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_BUCKET=card-images

# Security
APP_JWT_SECRET=your-very-secure-secret
LICENSE_CODE=1185131519
ENABLE_ADDITIONAL_EXPIRY_CHECK=false

# Server
PORT=3000
FRONTEND_ORIGIN=http://localhost:3001

# Rate Limiting & Quotas
QUOTA_DECKS_PER_DAY=25
QUOTA_CARDS_PER_DAY=400
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:3000
NEXT_PUBLIC_TOKEN_KEY=aremos_token
```

## 🎯 AREMOS Algorithm

The AREMOS algorithm is a simplified spaced repetition system:

1. **Each card must be answered correctly twice**
2. **Correct answer**: Card moves to the end of the round
3. **Wrong answer**: Card is inserted before already correct cards
4. **Session complete**: All cards have been answered correctly twice
5. **Round-based processing**: Cards are organized in rounds with deterministic queue ordering

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `DELETE /api/auth/account` - Delete account
- `POST /api/auth/logout` - Logout (with token blacklisting)

### Decks
- `GET /api/decks` - List all decks
- `POST /api/decks` - Create deck (with collision suffix logic)
- `GET /api/decks/:id` - Get deck details
- `PUT /api/decks/:id` - Update deck name
- `PUT /api/decks/:id/alias-name` - Update alias name for copied decks
- `DELETE /api/decks/:id` - Delete deck

### Cards
- `GET /api/decks/:id/cards` - Get cards of a deck
- `POST /api/decks/:id/cards` - Create card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

### Practice Sessions
- `POST /api/practice/:deckId/start` - Start practice session
- `POST /api/practice/:sessionId/answer` - Submit answer
- `POST /api/practice/:sessionId/finish` - Finish session (save insights)
- `POST /api/practice/:sessionId/end` - End session (no save)
- `GET /api/practice/:sessionId/status` - Get session status

### Spaced Repetition
- `POST /api/decks/:id/sr` - Set spaced repetition dates
- `GET /api/decks` - Returns `dueToday` flag for 24h notifications

### Uploads
- `POST /api/uploads/decks/:deckId/cards/:cardId/image?side=question|answer` - Upload card image
- `DELETE /api/uploads/decks/:deckId/cards/:cardId/image?side=question|answer|both` - Delete card image

### Classrooms
- `GET /api/classrooms` - List classrooms
- `POST /api/classrooms` - Create classroom
- `POST /api/classrooms/:id/attach` - Pin deck to classroom
- `DELETE /api/classrooms/:id/members/:memberId` - Remove member
- `DELETE /api/classrooms/:id` - Delete classroom

### Insights
- `GET /api/insights/:deckId` - Get learning insights for deck
- Only latest session per user per deck is stored
- Insights are automatically deleted after 7 days

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark deck notification as read
- `POST /api/notifications/system/:id/read` - Mark system notification as read

## 🔒 Security

- **Global Rate Limiting**: 150 requests/minute/IP
- **Per-route Rate Limiting**: Additional limits per endpoint
- **Login Lockout**: After 10 failed attempts, 30 minutes lockout
- **JWT Tokens**: 2 hours validity with token versioning
- **Token Blacklisting**: JTI-based token invalidation
- **Input Validation**: All inputs validated with Zod schemas
- **CORS**: Configured for allowed origins only
- **Neutral Error Messages**: Generic error messages with field indicators

## 📊 Quotas & Limits

- **Decks**: 25 per day (Europe/Berlin timezone)
- **Cards**: 400 per day (Europe/Berlin timezone)
- **Images**: Max 10MB, JPG/PNG/WebP only
- **Inactivity**: Account cleanup after 365 days
- **Insights**: Stored for 7 days, then auto-deleted
- **Sessions**: Only latest session per user+deck stored

## 🎓 Learning Features

### AREMOS Algorithm
- Round-based card processing
- Each card requires 2 correct answers
- Deterministic queue ordering
- Session state management
- Complete learning history tracking

### Spaced Repetition
- 24h and 48h notification logic
- Europe/Berlin timezone handling
- Calendar-based planning
- Due-today indicators

### Insights & Analytics
- Learning session tracking
- Card interaction history
- Performance matrix (rounds × cards)
- Correct/incorrect/done indicators
- Duration and progress metrics

### Classroom Management
- Owner/member roles
- Deck pinning with versioning
- Member search (case-insensitive)
- Resource management (max 4 per lesson)
- Finalization workflow

## 🚀 Deployment

### Railway (Backend)
1. Connect GitHub repository to Railway
2. Configure environment variables in Railway
3. Add PostgreSQL service
4. Automatic deployment on Git push

### Vercel (Frontend)
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel
3. Set build command: `npm run build`
4. Automatic deployment on Git push

### Environment Variables for Production
```env
# Backend
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
APP_JWT_SECRET=...
FRONTEND_ORIGIN=https://your-domain.com

# Frontend
NEXT_PUBLIC_API_BASE=https://your-api-domain.com
```

## 🧪 Development Scripts

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run generate     # Generate Prisma client
npm run migrate:dev  # Run database migrations
npm run db:studio    # Open Prisma Studio
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📝 License

All rights reserved. This project is proprietary and not intended for public use.


