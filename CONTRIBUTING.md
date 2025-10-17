# Contributing to AREMOS

Thank you for your interest in contributing to AREMOS!

## 🚀 Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Setup** the development environment (see README.md)
4. **Create** a feature branch
5. **Commit** your changes
6. **Push** and create a Pull Request

## 📋 Development Guidelines

### Code Style

#### Frontend (TypeScript/React)
- **Functional components** only, no class components
- **TypeScript** strictly typed
- **TailwindCSS** for styling, no inline styles
- **Consistent naming conventions** (PascalCase for components)

#### Backend (Node.js/Fastify)
- **Fastify** framework (no Express)
- **Prisma** for database access
- **Zod** for input validation
- **Rate limiting** for all endpoints

### Git Workflow

#### Branch Naming
```
feature/card-image-upload
bugfix/login-rate-limit
hotfix/security-jwt
docs/api-documentation
```

#### Commit Messages
```
feat: Add image upload for cards
fix: Correct rate limiting implementation
docs: Update API endpoint documentation
refactor: Simplify authentication middleware
```

### Testing

- **Backend**: Build tests through CI/CD
- **Frontend**: Lint + Build tests
- **Manual testing** for critical flows

## 🔒 Security Guidelines

### Forbidden
- ❌ Plaintext passwords
- ❌ API keys in frontend
- ❌ SQL injection vulnerabilities
- ❌ Unlimited JWTs
- ❌ Missing rate limits

### Required
- ✅ bcrypt for password hashing
- ✅ JWT with 2h expiration
- ✅ Input validation with Zod
- ✅ Rate limiting (150/min/IP + per-route)
- ✅ CORS properly configured

## 📊 Architecture Principles

### AREMOS Algorithm
- Each card must be answered **correctly twice**
- **Correct** → Card moves to end of round
- **Incorrect** → Card inserted before already correct cards
- **Session abort** → No intermediate saving
- **Round-based processing** with deterministic queue ordering

### Data Model
- **Users** (bcrypt-hashed passwords + license codes)
- **Decks** (Creator + metadata + versioning)
- **Cards** (Text + optional images)
- **Sessions** (Only fully completed sessions stored)
- **Insights** (7 days TTL, latest session only per user+deck)
- **Classrooms** (Owner/member roles + deck pinning)
- **Notifications** (48h lifetime + read tracking)

## 🛠 Development Setup

### Required Tools
- Node.js 18+
- PostgreSQL
- Supabase Account (for storage)

### Installation
```bash
# Repository setup
git clone [your-fork-url]
cd aremos

# Backend
cd aremos-backend
npm install
cp .env.example .env
# Configure .env with your values
npm run generate
npm run migrate:dev
npm run dev

# Frontend (new terminal)
cd aremos-frontend
npm install
cp .env.example .env.local
# Configure .env.local with backend URL
npm run dev
```

### Current Implementation Status
- ✅ **All API endpoints** implemented and functional
- ✅ **Authentication** with JWT (2h) + token versioning + JTI blacklisting
- ✅ **AREMOS Algorithm** fully implemented in practice sessions
- ✅ **Spaced Repetition** with Europe/Berlin timezone
- ✅ **Classroom Management** with member search + deck pinning
- ✅ **Image Upload** for cards (question/answer sides)
- ✅ **Insights & Analytics** with performance matrix
- ✅ **Notifications** with API integration + read tracking
- ✅ **Security** with global + per-route rate limiting
- ✅ **Input Validation** with Zod schemas
- ✅ **Error Handling** with neutral messages + field indicators

## 📝 Pull Request Checklist

### Before PR
- [ ] Branch is up-to-date with main
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] New features have appropriate documentation
- [ ] TypeScript compilation is clean
- [ ] No security vulnerabilities introduced

### PR Description
- **What** was changed?
- **Why** was the change necessary?
- **How** was it implemented?
- **Testing** performed?
- **Breaking changes** (if any)?

### Code Review
- At least **1 reviewer** required
- **CI/CD tests** must be green
- **Resolve conflicts** before merge
- **Security review** for auth/validation changes

## 🐛 Bug Reports

### Template
```markdown
**Description**
Brief description of the bug

**Reproduction**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]
- API Response: [if applicable]
```

## 💡 Feature Requests

### Template
```markdown
**Problem**
What problem does this feature solve?

**Solution**
Description of the desired solution

**Alternatives**
Other solution approaches considered

**Additional Context**
Screenshots, mockups, etc.

**Implementation Notes**
Technical considerations (if any)
```

## 🚀 Current Architecture

### Tech Stack
- **Frontend**: Next.js 15 + TypeScript + TailwindCSS (hosted on Vercel)
- **Backend**: Fastify + Prisma + PostgreSQL (hosted on Railway)
- **Storage**: Supabase for card images (JPG/PNG/WebP, max 10MB)
- **Auth**: JWT with token versioning + bcrypt + license codes
- **Security**: Global rate limiting + per-route limits + input validation

### API Structure
- **Auth**: `/api/auth/*` - Registration, login, logout, account deletion
- **Decks**: `/api/decks/*` - CRUD operations + versioning
- **Cards**: `/api/cards/*` - CRUD operations + image support
- **Practice**: `/api/practice/*` - Session management + AREMOS algorithm
- **Classrooms**: `/api/classrooms/*` - Management + member operations
- **Uploads**: `/api/uploads/*` - Image upload/deletion
- **Insights**: `/api/insights/*` - Learning analytics
- **Notifications**: `/api/notifications/*` - Real-time notifications

## 📞 Questions?

- **GitHub Issues** for bugs and feature requests
- **GitHub Discussions** for general questions
- **Code Reviews** for technical discussions
- **Security Issues** should be reported privately

---

Thank you for contributing to AREMOS! 🎓
