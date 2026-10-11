# OctoFit Tracker API

The Express API runs on port `8000` and connects to the `octofit_db` MongoDB database. Configure `MONGODB_URI` to override the default `mongodb://localhost:27017/octofit_db`.

Run the API in development with `npm run dev`, build it with `npm run build`, and start the compiled server with `npm start`.

Populate or refresh the sample users, teams, activities, leaderboard entries, and workouts with `npm run seed`. Seeding uses upserts and does not clear existing database records, so it can be rerun safely.

All collection endpoints support `GET`, `POST`, and resource-specific `GET /:id`, `PATCH /:id`, and `DELETE /:id` operations:

- `/api/users`
- `/api/teams`
- `/api/activities`
- `/api/leaderboard`
- `/api/workouts`

`GET /api` lists the tier API URLs, accounting for `CODESPACE_NAME`. `GET /api/health` reports API and MongoDB connection status. The browser API accepts requests from the local frontend on port `5173` or its matching Codespaces URL.
