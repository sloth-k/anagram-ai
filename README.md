# Angaram AI

An AI-generated newspaper-style word puzzle game inspired by Angaram-style jumbles.

## What it does

- Generates a fresh puzzle on every page load using Gemini.
- Shows 5 clue-based words with only some letters prefilled.
- Marks one position in each word as the "circled" letter.
- Unlocks a final 5-letter answer using the circled letters.
- Uses a top title clue whose answer is the final word.

## Project structure

- `frontend/`: Vite-powered static app for Vercel.
- `backend/`: Express API for Render.

## Local setup

1. Create a Gemini API key in Google AI Studio.
2. Copy `backend/.env.example` to `backend/.env`.
3. Copy `frontend/.env.example` to `frontend/.env`.
4. Fill in the API values.
5. Install dependencies:

```bash
npm install --prefix backend
npm install --prefix frontend
```

6. Run the backend:

```bash
npm run dev:backend
```

7. Run the frontend in another terminal:

```bash
npm run dev:frontend
```

## Environment variables

### Backend

- `PORT`: API port, defaults to `4000`
- `GEMINI_API_KEY`: required
- `GEMINI_MODEL`: optional, defaults to `gemini-2.5-flash-lite`
- `SESSION_TTL_MINUTES`: optional, defaults to `30`
- `ALLOWED_ORIGIN`: comma-separated allowed origins

### Frontend

- `VITE_API_BASE_URL`: backend URL such as `http://localhost:4000`

## Deploy

### GitHub

Use the exact commands in `DEPLOY.md`.

### Render backend

Create a new Web Service from the GitHub repo and set the Root Directory to `backend`.

### Vercel frontend

Import the same GitHub repo into Vercel and set the Root Directory to `frontend`.

See `DEPLOY.md` for the exact settings and commands.

## Notes

- The backend stores puzzle answers only in temporary in-memory sessions.
- No puzzle words are hardcoded or persisted.
- The code is structured so user accounts, leaderboards, or a daily mode can be added later.
