# Nutri-Stacker

Personalized meal plans from dietary goals, allergies, and macros. The LLM (Groq) drafts meals; FastAPI validates allergens before anything is stored in Supabase.

```
apps/web     Next.js (App Router, TypeScript, Tailwind)
apps/api     FastAPI + Groq
supabase/    SQL migration for profiles and plans
```

This is a first scaffold. Generation defaults to **one day** so Groq's free tier and a small laptop stay usable.

## Prerequisites

- Node.js 20+
- Python 3.11+
- A free [Supabase](https://supabase.com) project
- A free [Groq API key](https://console.groq.com/keys) (optional; mock meals work without it)

## 1. Supabase

1. Create a project.
2. Open **SQL Editor** and run `supabase/migrations/0001_init.sql`.
3. Enable **Email** auth (Authentication → Providers).
4. Copy from **Project Settings → API**:
   - Project URL
   - `anon` public key
   - `service_role` key (backend only — never put this in the frontend)
5. Copy **JWT Secret** from Project Settings → API (used if HS256 tokens are issued).

## 2. Groq

1. Sign in at [GroqCloud](https://console.groq.com/).
2. Open **API Keys**, create a key, and copy it once.
3. Put it in `apps/api/.env` as `GROQ_API_KEY`. Keep the default
   `GROQ_MODEL=openai/gpt-oss-20b`.

No payment method is needed for the Free plan. Its model-specific rate limits
are shown on the GroqCloud limits page.

## 3. Backend

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Fill in `.env`, then:

```powershell
uvicorn app.main:app --reload --port 8000
```

Health check: [http://localhost:8000/health](http://localhost:8000/health)

## 4. Frontend

```powershell
cd apps/web
copy .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, complete onboarding, then **Generate today**.

## How generation works

1. Next.js sends the Supabase access token to FastAPI.
2. FastAPI verifies the JWT and loads the user profile.
3. Groq returns **one meal** as strict JSON (name, grams, steps).
4. Code rejects meals that hit allergy keywords, then retries.
5. Valid meals are saved in Supabase (`meal_plans` → `meals` → `meal_items`).

If `GROQ_API_KEY` is empty, the API saves mock meals so you can still wire up the UI.

## Notes

- Do not commit `.env` or `.env.local`.
- Nutrition numbers from Groq are estimates until a food database is added.
- This is not medical advice.
