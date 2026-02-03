# TMS Demo – Task Management System

A **demo** web app for task management with role-based access (Super Admin, Admin, User), departments, and localStorage-only persistence. No backend.

## Stack

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS**
- **React Router**
- **LocalStorage** (no API, no database)

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Default Super Admin

- **Email:** `superadmin@tms.demo`
- **Password:** any (demo ignores password; login is email-only for approved users)

## Roles & access

| Role         | Access |
|-------------|--------|
| **Super Admin** | Global dashboard, User Management (approve/assign role & department), Task Management (all tasks), department overview. |
| **Admin**       | Department dashboard, department tasks, Team (read-only). |
| **User**        | My Dashboard, My Tasks (assigned only). |

## Departments (preloaded)

BDE, Marketing, Sales, HR, Tech.

## Auth flow

1. **Signup:** Name, Email, Department, Role (Admin/User). New users are **PENDING** and cannot log in.
2. **Approval:** Only Super Admin can approve (and optionally change role/department). Only **APPROVED** users can log in.
3. **Login:** Email only (password is ignored in this demo).

## Task rules

- **Super Admin:** Create/edit/assign/forward any task.
- **Admin:** Create/edit/assign/forward tasks in their department.
- **User:** Update status on any task; forward only their own tasks.

## Scripts

- `npm run dev` – dev server
- `npm run build` – production build
- `npm run preview` – preview production build

## Project structure

```
src/
  components/   # Layout, Modal, ProtectedRoute, StatsCard, TaskCard
  context/     # AuthContext
  lib/         # constants, storage, taskService
  pages/       # Login, Signup, Dashboard, UserManagement, TaskManagement, Team
  types/       # Shared types
```

This is a **demo** only: no real auth, no backend, no production hardening.
