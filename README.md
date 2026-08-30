<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1uXrZS13APHCOnlNgD9hnNJrpg5fh-c31

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy `.env.example` → `.env.local` and set:
   - `OPENROUTER_API_KEY` (required for the AI chatbot)
   - optional: `OPENROUTER_MODEL`, `OPENROUTER_FALLBACK_MODEL`
3. Run the app: `npm run dev`  
   Local `/api/chat` is served by the Vite OpenRouter streaming proxy.

## Deploy (Netlify)

Set the same `OPENROUTER_*` variables in the Netlify project env, then deploy.  
The serverless handler lives at `netlify/functions/chat.ts` (`/api/chat`).
