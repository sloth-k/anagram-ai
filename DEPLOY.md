# Deployment Guide

## 1. Initialize and push to GitHub

Run these commands from `angaram-ai`:

```bash
git add .
git commit -m "Initial Angaram AI game"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/angaram-ai.git
git push -u origin main
```

If you use GitHub CLI and want to create the repo from terminal:

```bash
gh repo create angaram-ai --public --source=. --remote=origin --push
```

## 2. Render backend setup

Create a new Render Web Service and use these values:

- Repository: your GitHub repo
- Branch: `main`
- Root Directory: `backend`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

Set these environment variables in Render:

- `OPENAI_API_KEY`: your OpenAI API key
- `OPENAI_MODEL`: `gpt-4o-mini`
- `SESSION_TTL_MINUTES`: `30`
- `RATE_LIMIT_WINDOW_MINUTES`: `10`
- `RATE_LIMIT_MAX_REQUESTS`: `20`
- `ALLOWED_ORIGIN`: your Vercel frontend URL, for example `https://angaram-ai.vercel.app`

After deploy, note your backend URL, for example:

```text
https://angaram-ai-api.onrender.com
```

Health check URL:

```text
https://angaram-ai-api.onrender.com/health
```

## 3. Vercel frontend setup

Create a new Vercel project and use these values:

- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Set this environment variable in Vercel:

- `VITE_API_BASE_URL`: your Render backend URL, for example `https://angaram-ai-api.onrender.com`

## 4. Update CORS after frontend deploy

Once Vercel gives you the final frontend URL:

1. Open Render service settings.
2. Update `ALLOWED_ORIGIN` to the exact Vercel production URL.
3. Redeploy the Render service.

## 5. Suggested release flow

For future updates:

```bash
git add .
git commit -m "Describe your change"
git push
```

Render and Vercel can both auto-deploy from `main`.
