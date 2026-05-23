# Core Engineering Rules
1. Reuse canonical schemas and types from server/src/db/tables.ts.
2. Do not recreate table schemas manually in route files or forms if reusable schema composition works.
3. Prefer schema composition (omit, pick, extend, partial) over duplicating validation logic.
4. For protected client API calls, use requestServer(path, options).
5. Do not hardcode user IDs. Use auth context on client and req.userId on server.
6. Keep response and payload shapes consistent across client and server.
7. Keep changes minimal and targeted; avoid unrelated refactors.
8. For transactional DB logic, prefer executeTransaction from server/src/db/executeTransaction.ts instead of raw db.transaction().execute(...), especially because tests often pass controlled transactions.
9. All migrations go in `server/src/migrations/` as numbered `.ts` files (e.g. `004_...ts`).
10. All routes must be registered in `server/src/index.ts`.
11. Use Kysely query builder for all DB queries — no raw SQL.
12. Validate all incoming request bodies with Zod before touching the DB.
13. All protected routes must use `authMiddleware` from `server/src/middleware/auth.ts`.
14. Frontend API calls to the backend use `http://localhost:3001` in development.
15. Use DaisyUI components and Tailwind utility classes for all UI — no custom CSS unless absolutely necessary.
16. All text must use `text-base-content` — never hardcode colors in components.
17. Use `useAuth()` from `client/src/context/useAuth.ts` to access the current user.

