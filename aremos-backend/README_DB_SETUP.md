# AREMOS Backend – DB/Storage Switch (Postgres & Supabase)

## 1) Fill .env
```
# DB
DB_DRIVER=prisma
DATABASE_URL=postgres://USER:PASS@HOST:5432/DBNAME

# Auth
APP_JWT_SECRET=please-change-me
LICENSE_CODE=1185131519

# Storage
STORAGE_DRIVER=supabase   # oder 'local'
SUPABASE_URL=...
SUPABASE_KEY=...
SUPABASE_BUCKET=card-images
STORAGE_LOCAL_DIR=./uploads

# Timezone
TZ=Europe/Berlin
```

## 2) Dependencies
```
npm i
npm i -D prisma
npx prisma generate
```

## 3) Apply Migrations
```
npx prisma migrate dev   # local
# or in Prod:
npx prisma migrate deploy
```

## 4) Start
```
npm run start   # or npm run dev
```

## Notes
- With `DB_DRIVER=memory` DB calls are intentionally disabled and return a clear error message.
- Uploads:
  - `STORAGE_DRIVER=local` → Files go to `public/uploads`.
  - `STORAGE_DRIVER=supabase` → Placeholder is wired; replace the implementation in `src/storage/supabase.adapter.ts` with real Supabase client logic.
- Prisma models are aligned with controllers and cronjobs (names/fields).
