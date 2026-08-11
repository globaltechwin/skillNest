# SkillNest Academy

A full-stack tutoring platform connecting students with verified tutors for online and offline learning. Built with Next.js 16, Clerk, Prisma, and MySQL.

## Features

### Student

- Browse Teachers — Search and filter by subject, teaching mode, level, and location
- Teacher Profiles — View detailed profiles with courses, reviews, availability, and qualifications
- Enrollment — Request to join courses; requests are reviewed by teachers
- Messaging — Real-time conversation with teachers
- Assignments — View and submit assignments for enrolled courses
- Class Schedule — View upcoming and past class sessions
- Notifications — Get notified about enrollments, messages, assignments, and classes
- Reviews and Ratings — Rate and review teachers after enrollment
- Profile Photos — Teachers can upload profile photos visible across the platform

### Teacher

- Multi-step Profile — Create a detailed profile with photo upload, subjects, qualifications, and availability
- Course Management — Create, edit, and publish courses
- Student Management — Accept or reject enrollment requests
- Assignments — Create assignments and grade student submissions
- Class Scheduling — Schedule and manage class sessions
- Messaging — Communicate with enrolled students
- Notifications — Get notified about enrollment requests, messages, and student activity
- Dashboard — Overview of earnings, students, courses, and recent activity

### Admin

- Dashboard — Platform-wide stats and overview
- Teacher Management — Review, approve, reject, or suspend teacher applications
- Student Management — View and manage student accounts
- Enrollment Management — View all enrollments across the platform

## Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Auth**: Clerk
- **Database**: MySQL 9 with Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+ or MariaDB
- Clerk account (for authentication)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/skillnest.git
cd skillnest
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

### 4. Set up the database

```bash
npx prisma db push
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable                              | Description             |
| ------------------------------------- | ----------------------- |
| `DATABASE_URL`                        | MySQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`   | Clerk publishable key   |
| `CLERK_SECRET_KEY`                    | Clerk secret key        |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`       | Sign-in page path       |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`       | Sign-up page path       |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in  |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up  |

## Database Seeding

The seed script populates 27 predefined subjects (English, Tamil, Math, Science, Yoga, Music, etc.):

```bash
npx prisma db seed
```

## Project Structure

```
src/
  app/
    admin/          # Admin dashboard and management pages
    api/upload/     # Photo upload API route
    student/        # Student dashboard, courses, teachers, messaging
    teacher/        # Teacher dashboard, profile, courses, students
    login/          # Login page
    register/       # Registration page
  components/       # Reusable UI components
  lib/              # Utilities, validations, notifications, auth helpers
prisma/
  schema.prisma     # Database schema
  seed.ts           # Database seed script
```

## License

Global Techwin
