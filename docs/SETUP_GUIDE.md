# CampusHub — Setup & Execution Guide

Follow these simple steps to run CampusHub locally on your machine.

---

## 1. Prerequisites

- **Node.js**: v18.18+ or v20+ (tested on v22.19.0)
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI (running on port `27017` by default)
- **Git**

---

## 2. Environment Configuration

CampusHub requires two primary environment variables:
1. `MONGODB_URI`: The MongoDB connection string.
2. `JWT_SECRET`: A secure key used for signing session JWT tokens.

Create a `.env.local` file in the root directory (a `.env.example` template is provided):

```env
MONGODB_URI=mongodb://127.0.0.1:27017/campushub
JWT_SECRET=campushub_production_secure_jwt_secret_key_987654321_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Dependency Installation

Install all required dependencies:

```bash
npm install
```

---

## 4. Database Seeding

Populate the database with demo colleges, categories, student profiles, marketplace listings, sample chats, and an administrator account:

```bash
npm run seed
```

Output confirmation will display:
```
========================================================
🎉 CAMPUSHUB DATABASE SEEDED SUCCESSFULLY!
========================================================
DEMO ACCOUNTS READY TO TEST:
--------------------------------------------------------
1. STUDENT ACCOUNT (Aarav Sharma - IIT Delhi)
   Email:    aarav.sharma@iitd.ac.in
   Password: Student@123

2. STUDENT ACCOUNT (Priya Patel - DTU)
   Email:    priya.patel@dtu.ac.in
   Password: Student@123

3. ADMINISTRATOR ACCOUNT (Campus Affairs Moderator)
   Email:    admin@campushub.edu
   Password: Admin@123
========================================================
```

---

## 5. Starting the Development Server

Start Next.js in development mode:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 6. Building for Production

To validate TypeScript compilation and produce the optimized production build:

```bash
npm run build
npm run start
```

---

## 7. Running Tests & Verifications

Execute the automated verification script:

```bash
npm test
# or
npx tsx scripts/test-verification.ts
```
