# Collabocode

A collaborative coding web app (frontend) built with React, TypeScript, Vite, Tailwind CSS, Supabase, Yjs, and Judge0 for live collaborative coding, real-time chat, and remote code execution.

Features

- Real-time collaborative editor using Yjs and Monaco
- Live chat and collaborator presence
- Run and judge code via Judge0 service
- Notifications and session management via Supabase

Tech stack

- Frontend: React + TypeScript
- Bundler: Vite
- Styling: Tailwind CSS
- Realtime & auth: Supabase
- Collab sync: Yjs (custom Supabase provider)
- Code execution: Judge0

Quick start (development)

1. Install dependencies and enter the web app directory:

```bash
cd web
npm install
```

2. Create a `.env` file in the `web` folder and add required environment variables. Typical variables used by the app (example names — confirm against your deployment env):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY` (only for server-side operations)
- `VITE_JUDGE0_BASE_URL`
- `VITE_JUDGE0_API_KEY`

3. Run the dev server:

```bash
npm run dev
```

Build & preview

```bash
npm run build
npm run preview
```

Deployment

- The project contains a `vercel.json` and is ready for deployment to Vercel or any static host that supports Vite builds. Ensure the environment variables are set in your hosting provider.

Project layout

- `web/src` — main frontend source
- `web/src/pages` — page-based structure (match, collaboration, profile, etc.)
- `web/src/services` — backend integrations (Supabase, Judge0, Yjs provider)
- `web/public` — static assets

Contributing

- Open an issue or submit a PR. Follow existing code style and TypeScript types.

Need help?

- If you'd like, I can add a `.env.example`, wire up a basic Vercel deployment guide, or update scripts in `web/package.json` — tell me which and I'll add it.

License

- Check the repo root `LICENSE` for license details.
