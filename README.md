# AI Refund Generator

AI Refund Generator is a minimal Next.js MVP that helps passengers check EU261-style eligibility and purchase an AI-generated claim letter.

## Features
- Next.js App Router with responsive Tailwind UI
- Mock eligibility engine with persistent scan storage (Prisma + SQLite)
- Stripe Checkout for the $9 claim letter purchase
- OpenAI-powered letter generation with PDF download
- REST-style API routes with type-safe contracts
- Vitest unit tests and ESLint/Prettier configs

## Getting started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Environment variables** — copy `.env.example` to `.env` and fill in:
   ```ini
   STRIPE_SECRET_KEY=sk_live_or_test_
   STRIPE_PUBLISHABLE_KEY=pk_live_or_test_
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_
   OPENAI_API_KEY=sk-openai...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   DATABASE_URL="file:./prisma/dev.db"
   ```
3. **Database setup**
   ```bash
   npx prisma migrate dev --name init
   npm run prisma:generate
   ```
4. **Run the dev server**
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:3000.

## Stripe & OpenAI configuration
- The checkout session uses the secret key server-side; publishable key is surfaced in the UI via `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` if needed.
- Set your webhook/success URLs in the Stripe Dashboard to match `http://localhost:3000/success` and `/cancel` for local testing.
- Provide a valid OpenAI API key; without it, the API falls back to a deterministic template letter.

## Testing & linting
```bash
npm run test        # Vitest unit tests for eligibility logic
npm run lint        # ESLint (Next.js + Tailwind + Prettier)
npm run format      # Prettier formatting
```

## Production build
```bash
npm run build
npm run start
```

## Project structure
```
app/               # App Router pages & API routes
components/        # Reusable UI pieces
lib/               # Eligibility, Prisma, Stripe, OpenAI helpers
prisma/            # Prisma schema and migrations
```

## Notes
- The eligibility checker uses demo heuristics; plug in a real aviation API later.
- Stripe Checkout session metadata links scans to purchases; success page re-validates payment state server-side.
- Letter PDFs are rendered on-demand via pdfkit.
