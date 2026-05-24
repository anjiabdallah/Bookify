# Core Engineering Rules
1. Reuse canonical schemas and types from `server/src/db.ts`.
2. Do not recreate table schemas manually in route files or forms if reusable schema composition works.
3. Prefer schema composition (omit, pick, extend, partial) over duplicating validation logic.
4. For protected client API calls, use requestServer(path, options).
5. Do not hardcode user IDs. Use auth context on client and req.userId on server.
6. Keep response and payload shapes consistent across client and server.
7. Keep changes minimal and targeted; avoid unrelated refactors.
8. For transactional DB logic, use Kysely's built-in transaction support. (executeTransaction helper TBD)
9. All migrations go in `server/src/migrations/` as numbered `.ts` files (e.g. `004_...ts`).
10. All routes must be registered in `server/src/index.ts`.
11. Use Kysely query builder for all DB queries — no raw SQL.
12. Validate all incoming request bodies with Zod before touching the DB.
13. All protected routes must use `authMiddleware` from `server/src/middleware/auth.ts`.
14. Frontend API calls to the backend use `http://localhost:3001` in development.
15. Use DaisyUI components and Tailwind utility classes for all UI — no custom CSS unless absolutely necessary.
16. All text must use `text-base-content` — never hardcode colors in components.
17. Use `useAuth()` from `client/src/context/useAuth.ts` to access the current user.
18. Import response types from `server/src/api/types.ts` using relative paths.
19. Use `requestServer<ResponseType>(path, options)` from `client/src/lib/requestServer.ts` for all API calls.
20. Use `useAsync` from `client/src/hooks/useAsync.ts` for handling loading and error states.

## Type Safety Requirements
This project is VERY STRICT with types. All API responses must be properly typed.

## Implementation Reality
- All routes have `*Response` types under `server/src/api/routes/**/**.types.ts` and are re-exported from `server/src/api/types.ts`.
- Frontend calls use `requestServer<...>` with typed response interfaces from `server/src/api/types`.
- `server` source uses `.ts` imports during development/build.
- `useAsync` is used throughout client pages for async action handling.

## Backend Type Rules
1. Every route module must have a corresponding `.types.ts` file in the same directory.
2. Each `.types.ts` file must export TypeScript types for all JSON responses returned by routes in that module.
3. Response types should be named with a `*Response` suffix (e.g., `GetUserResponse`, `CreatePostingResponse`).
4. All `.types.ts` files must be imported and re-exported in `server/src/api/types.ts` for centralized access.

## Frontend Type Rules
1. In ALL cases, when calling `requestServer()`, pass the appropriate `*Response` type from `server/src/api/types.ts`.
2. Never use `any` or untyped responses for API calls.
3. Never create separate client-side types that mirror server responses — always reuse server-defined types.
4. Import response types from `server/src/api/types` using relative paths (e.g., `../../../server/src/api/types` from `client/src/hooks/` or `../../../../server/src/api/types` from `client/src/pages/*/`).

## Backend Conventions
1. Route modules live under `server/src/api/routes/<domain>/`.
2. All TypeScript imports use `.js` extensions for ESM compatibility.
3. Validate request bodies with Zod at the start of each route.
4. Access authenticated user ID via `req.userId`.
5. Keep DB operations typed via Kysely.
6. Never return `{ success: true }` — success is inferred from HTTP status code.

## Schema & Type Patterns
1. Always export both the Zod schema and its inferred TypeScript type:
   - `export const mySchema = z.object({...})`
   - `export type MyType = z.infer<typeof mySchema>`
2. Prefer schema composition over duplication using `.omit()`, `.pick()`, `.extend()`, `.partial()`.

## Migration Rules
1. Never modify old migrations that have already been applied.
2. Add a new numbered migration file for schema changes in `server/src/migrations/`.
3. When adding/removing DB fields, update the migration AND `server/src/db.ts`.

## Form Conventions
1. Always use `react-hook-form` with `zodResolver` for all forms — no uncontrolled inputs or manual state for forms.
2. Always define a Zod schema for the form and infer the type from it:
   - `const schema = z.object({...})`
   - `type FormData = z.infer<typeof schema>`
3. Use `useForm<FormData>({ resolver: zodResolver(schema) })` to initialize the form.
4. Use `register`, `handleSubmit`, and `formState: { errors, isSubmitting }` from `useForm`.
5. Display field errors using `errors.fieldName?.message`.
6. Use `isSubmitting` from `formState` for loading state — no separate `useState` for loading on forms.
7. Never use `useState` for form field values — let react-hook-form manage form state.

# Documentation Maintenance
1. When reusable components change (new props, behavior, moved location, deprecation), update this file’s component sections in the same task.
2. When hooks or utilities are added or edited (new options, return shape, conventions), update the related guidance in this file in the same task.
3. Treat AGENTS.md updates as part of the definition of done for changes that affect shared developer workflows.