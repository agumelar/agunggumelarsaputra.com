# Task 3 Report

## Goal
Implement Authentication Infrastructure (JWT helpers, Astro Middleware, `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/google`, `/api/auth/callback/google`).

## Changes
- Created `src/utils/auth.ts` containing `UserSessionPayload`, `signToken` and `verifyToken`.
- Created `src/middleware.ts` to protect `/dashboard` and `/pembelajaran` routes, redirecting unauthenticated users to `/login`.
- Created `src/env.d.ts` to extend `App.Locals` for type-safe access to the `user` object in Astro context.
- Created `src/pages/api/auth/register.ts` to handle new user registration using Drizzle ORM and bcryptjs.
- Created `src/pages/api/auth/login.ts` for handling user login and session cookie creation.
- Created `src/pages/api/auth/logout.ts` to handle session clearing.
- Created `src/pages/api/auth/google.ts` to initiate Google OAuth login with `arctic`.
- Created `src/pages/api/auth/callback/google.ts` to process the callback, create/update user in the DB, and set session cookie.

## Result
Status: DONE.
All files have been successfully created and committed to the repository.
