# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Web system for the demographic census and neighbor talents of Consejo Comunal Alto Barinas Norte (Barinas, Venezuela). It is a modular monolith in Next.js with Prisma and PostgreSQL. The UI, domain identifiers and project docs are in Spanish.

- `Design System.md` is the authoritative requirements document (RF/RNF codes, data dictionary, roles, screens). Despite its name it is a system design document, not a UI design system.
- `docs/ARQUITECTURA.md` defines the folder structure, layering rules and build order. Read both before starting a module.

Stages 0 (base), 1 (M1 Seguridad), 2 (M8 catalogs and council name), 3 (M2 Viviendas), 4 (M3 Familias) and 5 (M4 Habitantes) are built. Next is Stage 6 (M5 Talentos). Build one module at a time, in the order given in `docs/ARQUITECTURA.md`.

## Working with this user

- The user makes all git commits. Never commit; report when a stage is ready.
- Ask one question at a time.

## Commands

```bash
npm run dev            # http://localhost:3000
npm run build
npm run lint
npx prisma db seed     # creates the first admin (user "admin") from ADMIN_PASSWORD; no-op if an admin exists
npx prisma studio
```

There is no automated test suite. A stage is verified with build, lint and exercising the running app.

If a build fails on `.next/dev/types/validator.ts` pointing at a deleted route, the types are stale: delete `.next` and rebuild.

Creating a migration from a non-interactive shell (`prisma migrate dev` is meant for an interactive terminal):

```bash
mkdir prisma/migrations/<yyyyMMddHHmmss>_<nombre>
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script -o prisma/migrations/<carpeta>/migration.sql
npx prisma migrate deploy
npx prisma generate
```

Review the SQL before applying it. Each module adds its own tables in its own migration. Initial catalog rows go in the migration as `INSERT`s so they also reach deployment. Constraints Prisma can't express go in the same SQL by hand, and later diffs must not drop them: the partial unique index `habitante_un_jefe_activo_por_nucleo` (one active `JEFE` per family), and the checks `habitante_nacionalidad_valida` and `nucleo_familiar_ingreso_no_negativo`.

Environment variables are listed in `.env.example`. `COOKIE_SEGURA="false"` is required when serving over plain http, otherwise the session cookie is not stored.

## Architecture

- `src/app/` holds thin routes only, in the `(auth)` and `(panel)` route groups.
- `src/modules/<modulo>/` has `schemas.ts` (Zod), `queries.ts` and `actions.ts` (the only files that touch the database), and `components/`.
- `src/shared/` holds UI components and `lib/`. It must not import from modules.
- Modules depend in one direction: configuracion → viviendas → familias → habitantes → talentos → proyectos → reportes. `seguridad` and `shared` are available to all.

`src/modules/seguridad/` is the reference implementation for new modules. When an earlier module's screen must show a later module's data, such as families on the vivienda page, compose both components in the `src/app/` page so the module dependency stays one-way.

### Authentication

`src/proxy.ts` only checks that the cookie exists, to redirect quickly. The real check is `requerirSesion()` in `src/shared/lib/sesion.ts`, which also confirms in the database that the user is active. Every query and every Server Action must call it, because Server Actions are reachable by direct POST. The only exception is `obtenerNombreConsejo`, since the login screen shows the council name.

Role restrictions are deliberately deferred to Stage 9: `rol` is stored but nothing enforces it yet, so any logged-in user can do everything. They must be in place before real data is loaded or the system is deployed. Add them by changing the `requerirSesion()` calls. Still undecided: whether the Consulta role sees per-person health and disability data or only totals.

### Server Action pattern

Form actions have the signature `(estado: EstadoFormulario, formData: FormData)` and are used with `useActionState`. The order is:

1. `requerirSesion()`
2. `safeParse` with Zod, returning `errores` and `valores` on failure (React resets the form after submit, and `valores` restores it; never include passwords)
3. `db.$transaction` containing the write and `registrarBitacora(tx, ...)`
4. `revalidatePath`, then `redirect` outside any `try`, because `redirect` throws

`src/shared/lib/acciones.ts` has the shared helpers: `aErrores`, `sinContrasenas`, `aIdPositivo` for ids from URLs, and `esDuplicado`, `violaReferencia` and `noExiste` for Prisma errors. Use `BotonConfirmar` for actions that need confirmation. Do slow work such as bcrypt hashing outside the transaction. Validate string arguments bound to an action, such as `catalogo`, since clients can tamper with them.

### Cache Components

`cacheComponents` is enabled in `next.config.ts`, which constrains rendering:

- Anything reading the session or database at request time must sit in a server component inside `<Suspense>`. Pages stay synchronous and render it as a child.
- Don't `await` the session at the top level of a layout.
- `usePathname` needs a `<Suspense>` parent on layouts above dynamic routes.
- `params` is a Promise; await it inside the Suspense boundary.
- Convert Prisma `Decimal` values to strings in `queries.ts`; they can't be passed to client components.

## Tooling notes

- Prisma is pinned to exactly 7.10.1. npm's `latest` tag points to an 8.0 release candidate, so ignore its update notices and don't install `@latest`.
- The Prisma client is generated to `src/generated/prisma` (gitignored, rebuilt by `postinstall`). Import from `@/generated/prisma/client`. It needs the `PrismaPg` adapter, set up in `src/shared/lib/db.ts`.
- Running `prisma init` adds agent skill folders to the repo; it isn't needed again.
- Database naming: PascalCase Prisma models and camelCase fields, mapped with `@@map` and `@map` to the snake_case names in the data dictionary.
- shadcn/ui uses the `base-nova` style on Base UI, not Radix: compose with the `render` prop rather than `asChild`, and pass `nativeButton={false}` when a `Button` renders a link. `components.json` aliases point to `@/shared/...`, so `npx shadcn@latest add <componente>` installs there.
- When a module is finished, set `listo: true` for it in `src/shared/components/navegacion.tsx`.
- Don't use `'use cache'` for database reads: it would run the query during `next build`, when a Docker build has no database. Read after `await connection()` or `requerirSesion()`, inside `<Suspense>`.
