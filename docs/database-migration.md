# SkillNest Database Migration Guide

This document covers how to back up the existing local MySQL database and move it to a new Railway MySQL database for testing.

> **IMPORTANT**: Never commit database credentials, `.env` files, or SQL dumps to Git. All credentials are provided through environment variables only.

---

## 1. Backup the Existing Local Database

Back up the current local MySQL database before doing anything else.

Recommended command (run from the project root):

```bash
mysqldump -u root -p \
  --single-transaction \
  --set-gtid-purged=OFF \
  skillnest > skillnest_final_backup.sql
```

- `--single-transaction` produces a consistent snapshot without locking tables.
- `--set-gtid-purged=OFF` avoids GTID header issues when importing into a fresh MySQL instance.
- The output file `skillnest_final_backup.sql` is git-ignored (see `.gitignore`, `*.sql` rule).

You will be prompted for the local MySQL password (e.g. the `root` password used by `DATABASE_URL` in `.env`).

---

## 2. Create a Railway MySQL Database

1. Go to https://railway.com and sign in.
2. Create a new project.
3. Add a **MySQL** database service (Railway provides a MySQL template).
4. Wait for the service to reach a healthy/running state.

---

## 3. Obtain the Railway `DATABASE_URL`

1. Open your Railway MySQL service → **Variables**.
2. Railway auto-provisions a `MYSQL_URL` (or `DATABASE_URL`) variable that looks like:
   `mysql://user:password@host:port/database`
3. Copy the full connection string.

> **Security**: Keep this value out of Git, screenshots, and chat logs. Do not expose the password.

---

## 4. Import the Existing Dump into Railway

Using the MySQL CLI:

```bash
mysql -h HOST -P PORT -u USER -p DATABASE \
  < skillnest_final_backup.sql
```

Replace `HOST`, `PORT`, `USER`, and `DATABASE` with the values from your Railway connection string. You will be prompted for the password.

Alternatives:

- Use a GUI client such as **TablePlus**, **Sequel Ace**, or **DBeaver** and run the `.sql` file as a query/import.
- Use `npx prisma db execute --file skillnest_final_backup.sql` after pointing `DATABASE_URL` at Railway (in a temporary script — do not commit the value).

---

## 5. Point the Project at Railway

Set `DATABASE_URL` to the Railway connection string in your **local environment only** (`.env` / `.env.local` / shell environment). Example:

```bash
export DATABASE_URL="mysql://user:password@host:port/database"
```

No code changes are needed — the project reads `DATABASE_URL` from the environment at runtime and in `prisma.config.ts`.

---

## 6. Connect and Verify

Connect to the Railway database with the MySQL CLI:

```bash
mysql -h HOST -P PORT -u USER -p DATABASE
```

Then run:

```sql
SHOW TABLES;
```

Verify all **16 expected SkillNest tables** are present:

```text
admin_audit_logs
assignment_submissions
assignments
class_sessions
conversations
course_enrollments
courses
messages
notifications
reviews
subjects
teacher_availability
teacher_profiles
teacher_qualifications
teacher_subjects
users
```

---

## 7. Verify Row Counts (Local vs Railway)

Run the following on **both** databases and compare counts:

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM teacher_profiles;
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM subjects;
SELECT COUNT(*) FROM course_enrollments;
SELECT COUNT(*) FROM assignments;
SELECT COUNT(*) FROM class_sessions;
SELECT COUNT(*) FROM messages;
SELECT COUNT(*) FROM notifications;
SELECT COUNT(*) FROM reviews;
SELECT COUNT(*) FROM admin_audit_logs;
SELECT COUNT(*) FROM teacher_availability;
SELECT COUNT(*) FROM teacher_qualifications;
SELECT COUNT(*) FROM teacher_subjects;
SELECT COUNT(*) FROM assignment_submissions;
SELECT COUNT(*) FROM conversations;
```

The row counts on Railway should match the local database for every table. If a table count differs, the dump/import did not fully succeed — investigate before testing the application.

---

## 8. Next Steps After Verification

With Railway as `DATABASE_URL`, run the Prisma introspection and validation steps:

```bash
npx prisma db pull
npx prisma generate
npx prisma validate
```

Then start the app:

```bash
npm run dev
```
