@AGENTS.md

# Shiftly Backend - Project Summary
Shiftly is a Shift & Expense Management System for 100+ branches and 1000+ employees.

## Tech Stack
- Frontend: Next.js (React, Tailwind, TypeScript)
- Backend: Next.js API Routes (App Router)
- Database: SQLite (via Prisma ORM) for local dev.
- Auth: Custom JWT with `jose` and `bcryptjs`.

## Current Status
- **Phase 1 (Completed):** Setup Prisma, SQLite `dev.db`, Auth API (`/api/v1/auth/login`), Role-Based Access Control middleware, and Employee/Branch APIs.
- **Phase 2 (In Progress):** Shift Types, Rates, Shift submissions & approvals, Expense tracking, and Receipt uploads.
