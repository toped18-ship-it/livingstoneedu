# AGENTS.md

LivingstoneEDU: a Nigerian school-management SaaS (AI lesson notes, exam generator, report cards, multi-role portals). Single-page Vite app + Express API in one repo.

## Layout & architecture
- `server.ts` (~3600 lines) is the whole backend: Express REST API under `/api/*`, plus dev (Vite middleware mode) and prod (static `dist/`) SPA serving. `npm run dev` starts one process on port 3000 that serves both API and frontend.
- Backend "database" is in-memory arrays at the top of `server.ts` (`usersStore`, `studentsStore`, etc.). API endpoints read/write those; data resets on restart. Firestore/RTDB only matter client-side (`src/lib/firebase.ts`); Firebase Admin SDK is in `server/firebaseAdmin.ts`.
- Frontend views live in `src/components/views/*.tsx`, switched by role-based state in `src/App.tsx` (not a router).
- sSolutAI AI via `@google/genai`: if `GEMINI_API_KEY` is missing, endpoints fall back to hardcoded deterministic JSON generators. AI responses are requested as JSON.

## Commands
- `npm run dev` — tsx `server.ts` (dev server + API, port 3000)
- `npm run build` — `vite build` + esbuild bundle of `server.ts` → `dist/server.cjs`
- `npm start` — run bundled `dist/server.cjs` (prod)
- `npm run lint` — `tsc --noEmit` (typecheck only; there is no linter). Passes clean currently.
- No test suite exists.

## Env & secrets
- `.env*` is gitignored except `.env.example`. `dotenv` is a dependency but is NOT loaded anywhere — env vars are injected externally (AI Studio runtime / GH Actions secrets / exported in shell). Running `npm run dev` locally without exporting vars uses code hardcoded fallbacks.
- Server code contains hardcoded fallback Firebase credentials (admin private key, client config in `src/lib/firebase.ts`, `server/firebaseAdmin.ts`). This is by design; don't "fix" or commit real `.env` values.

## Deploy
- `.github/workflows/deploy.yml` deploys ONLY the frontend (`vite build` → `dist/`) to GitHub Pages, with `index.html` copied to `404.html` for SPA fallback. The Express server is NOT deployed, so `/api/*` endpoints relying on in-memory data or sSolutAI will not work on Pages.

## Gotchas
- `vite.config.ts` disables HMR/file-watching under `DISABLE_HMR=true` (set by AI Studio) to stop flicker during agent edits. Don't remove that.
- sSolutAI model referenced in code is `gemini-3.6-flash` (older `gemini-1.5/2.5` strings also present).
- `tsconfig.json` maps `@/*` to repo root (unused but configured).