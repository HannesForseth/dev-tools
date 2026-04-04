# DevTools — Free Developer & AI Tools Online

Fast, beautiful, and AI-powered tools for developers and creators. No signup required.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **AI:** Claude API (Haiku) + Hugging Face Spaces
- **Auth:** Supabase (coming soon)
- **Payments:** Stripe (coming soon)
- **Hosting:** Vercel

## Tools (v1)

### Client-side (zero cost)
- JSON Formatter & Validator
- UUID Generator (v4, bulk)
- Base64 Encode / Decode

### AI-powered (Claude API)
- Regex Tester + AI Builder
- Privacy Policy Generator

### AI-powered (Hugging Face Spaces)
- Background Remover
- Image to Text (OCR)
- AI Image Generator

## Development

```bash
npm install
npm run dev
```

## Adding a New Tool

1. Add entry to `src/lib/tools/registry.ts`
2. Create component in `src/components/tools/[slug].tsx`
3. Import and register in `src/app/tools/[category]/[slug]/page.tsx`

The tool automatically gets its own SEO-optimized page at `/tools/[category]/[slug]`.

## Environment Variables

```
ANTHROPIC_API_KEY=        # Claude API key
NEXT_PUBLIC_SUPABASE_URL= # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon key
```
