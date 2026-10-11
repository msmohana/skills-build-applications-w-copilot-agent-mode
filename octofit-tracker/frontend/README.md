# OctoFit Tracker presentation tier

The React 19 + Vite frontend runs on port `5173` and uses React Router for activities, leaderboard, teams, users, and workouts.

## API configuration

The frontend reads `import.meta.env.VITE_CODESPACE_NAME` when it is built or started. **Define `VITE_CODESPACE_NAME` in `octofit-tracker/frontend/.env.local`** for Codespaces, using the Codespace name only:

```dotenv
VITE_CODESPACE_NAME=your-codespace-name
```

Vite uses that value to call `https://<codespace-name>-8000.app.github.dev`. If it is unset, the frontend falls back to `http://localhost:8000`. Restart the Vite development server after changing `.env.local`. Do not commit `.env.local`.

The collection helper accepts plain arrays and common paginated response envelopes such as `results`, `items`, `docs`, `records`, or nested `data`.

Run the frontend with `npm run dev --prefix octofit-tracker/frontend`, build it with `npm run build --prefix octofit-tracker/frontend`, and lint it with `npm run lint --prefix octofit-tracker/frontend`.
