# Fas 2: Strategidokument

*2026-04-04 — Baserat på Fas 1 research*

---

## 1. Go/No-Go-beslut

### GO.

Researchen visar entydigt att detta är värt att bygga:

- **Marknaden existerar** — enskilda verktyg som Regex101 och Crontab.guru drar 1-5M besök/månad
- **Gapet är tydligt** — ingen kombinerar bredd + djup + design + AI + SEO
- **Kostnadsstrukturen är exceptionell** — 80%+ av verktygen har ~0 marginalkostnad
- **AI-differentiering är outnyttjad** — nästan ingen konkurrent har AI-integrering

Det enda scenariot där detta inte fungerar är om vi bygger medelmåttiga verktyg med tunnt SEO-content. Kvalitet per verktyg är den enskilt viktigaste framgångsfaktorn.

---

## 2. Nischval — Dual Strategy

**Dev-tools + AI media-tools.** Inte bara det ena.

**Varför:**
- Dev-tools (UUID, JSON, Regex) ger **nischad, high-intent trafik** med låg konkurrens (KD 20-35)
- AI media-tools (bakgrundsborttagning, OCR, TTS) ger **massiv volym** (600K+ sökningar/mo per keyword)
- Samma infrastruktur (Next.js + Supabase + Stripe) bär båda kategorierna
- Dev-tools bygger domänauktoritet snabbt → hjälper media-tools att ranka senare

**Positionering:** "The modern toolkit" — inte bara för utvecklare, inte bara för kreatörer. Snabba, vackra, AI-förstärkta verktyg för alla som arbetar digitalt.

---

## 3. Verktyg-prioritering — Top 20

Rangordnat efter: (sökvolym × byggbarhet × AI-potential × marginal)

### Fas 1: Bygger FÖRST (Vecka 1-3) — Proof of Concept

| # | Verktyg | Kostnadsnivå | Sökvolym | KD | Motivering |
|---|---------|-------------|----------|-----|-----------|
| 1 | JSON Formatter & Validator | Client-side + Claude | ~200K | 35 | Kärnverktyg, AI-felförklaring som differentiator |
| 2 | UUID Generator | Client-side | ~200K | 30 | Trivial att bygga, hög volym, validerar SEO |
| 3 | Base64 Encode/Decode | Client-side | ~180K | 30 | Snabb vinst, kräver 0 infrastruktur |
| 4 | Background Remover | HF (not-lain) | ~600K | 55 | Enormt sökvolym, testar HF-integration |
| 5 | Image to Text / OCR | HF (DeepSeek-OCR) | ~250K | 40 | Bred publik, testar HF-pipeline |
| 6 | Regex Tester + AI Builder | Client-side + Claude | ~150K | 30 | Bästa AI-differentiering |
| 7 | Privacy Policy Generator | Claude | ~100K | 40 | Högst CPC ($3), testar Claude-pipeline |
| 8 | AI Image Generator | HF (flux1_schnell) | ~500K | 60 | Viral potential, wow-faktor |

### Fas 2: Expansion (Vecka 4-8)

| # | Verktyg | Kostnadsnivå | Sökvolym | KD |
|---|---------|-------------|----------|-----|
| 9 | Text to Speech | HF (Chatterbox) | ~300K | 45 |
| 10 | Cron Expression Generator | Client-side + Claude | ~90K | 25 |
| 11 | Color Palette Generator | Client-side | ~200K | 40 |
| 12 | QR Code Generator | Client-side + HF (AI QR) | ~500K | 50 |
| 13 | Hash Generator (MD5/SHA) | Client-side | ~60K | 20 |
| 14 | Image Upscaler | HF (RealESRGAN) | ~150K | 40 |
| 15 | SQL Formatter + AI | Client-side + Claude | ~80K | 25 |
| 16 | Diff Checker | Client-side | ~100K | 30 |

### Fas 3: Dominans (Vecka 9-12)

| # | Verktyg | Kostnadsnivå | Sökvolym | KD |
|---|---------|-------------|----------|-----|
| 17 | JWT Decoder | Client-side | ~80K | 20 |
| 18 | Lorem Ipsum Generator | Client-side | ~150K | 30 |
| 19 | Markdown to HTML | Client-side | ~40K | 20 |
| 20 | Photo Restoration | HF (InstantIR) | ~80K | 35 |

---

## 4. Prismodell

### Tre tiers

| | Free | Pro | Business |
|---|------|-----|----------|
| **Pris** | $0 | $9/mo ($79/år) | $19/mo ($149/år) |
| **Alla verktyg** | Ja | Ja | Ja |
| **AI-anrop/dag** | 10 | Obegränsat | Obegränsat |
| **Media-kvalitet** | Lågupplöst / vattenmärke | Full HD, inget vattenmärke | Full HD |
| **API-access** | Nej | 1,000 anrop/mo | 10,000 anrop/mo |
| **Batch-bearbetning** | Nej | Nej | Ja |
| **Prioritet** | Standard | Standard | Förtur i kö |

### Konverteringsmekanismer

1. **Kvalitetsgating** för mediaverktyg — gratis = lågupplöst/vattenmärke, Pro = full HD
2. **Volymgating** för AI-verktyg — 10 gratis anrop/dag, sedan "Uppgradera till Pro"
3. **API-access** som Pro-exklusiv feature
4. **Mjuk CTA** — aldrig popup, bara subtil "Unlock Pro" under verktyget

### Varför $9/mo

- Validerat av Remove.bg, Clipdrop, ElevenLabs, Unscreen
- Lågt nog för impulsköp, högt nog för meningsfull MRR
- Med HF-verktyg som har ~0 marginalkostnad → nästan 100% marginal på mediaverktyg
- Claude Haiku-kostnaden per Pro-användare: ~$0.50-2.00/mo (vid 100-500 AI-anrop/mo) = 78-94% bruttomarginal

---

## 5. SEO-strategi

### URL-struktur

```
/tools/dev/json-formatter
/tools/dev/regex-tester
/tools/dev/uuid-generator
/tools/media/background-remover
/tools/media/image-to-text
/tools/media/text-to-speech
/tools/ai/privacy-policy-generator
```

### Per-sida SEO

- **Unik title tag** per verktyg: `"Free JSON Formatter & Validator Online | [Brand]"`
- **Unik meta description** (150-160 tecken) med CTA
- **H1** = verktygstitel, **H2** = funktionssektioner
- **500-1500 ord unikt expertcontent** under varje verktyg (vad, varför, hur, vanliga mönster, FAQ)
- **JSON-LD structured data** (WebApplication schema + FAQ schema)
- **OG-image** autogenererad per verktyg

### Teknisk SEO

- **SSR/SSG via Next.js App Router** — varje verktyg = statisk sida med dynamisk interaktivitet
- **Automatisk sitemap.xml** med alla verktygsidor
- **robots.txt** korrekt konfigurerad
- **Core Web Vitals** — client-side-verktyg ska ladda < 1s
- **Internal linking** — varje verktyg länkar till 3-5 relaterade verktyg
- **Canonical URLs** för att undvika duplicering

### Contentstrategi

- **Inte tunna sidor.** Varje verktyg har genuint djupcontent.
- **FAQ-sektion** per verktyg (genererar Featured Snippets)
- **Exempelsektion** med vanliga användningsfall
- **"How it works"** — teknisk förklaring för trovärdighet

---

## 6. Namn & Domän

### Krav

- Fungerar för BÅDE dev-tools och AI media-tools
- Kort, memorerbart
- .com eller .io tillgänglig
- Inga generiska termer som "tools" ensamt

### Förslag (verifiera tillgänglighet)

| # | Namn | Domän | Motivering |
|---|------|-------|-----------|
| 1 | **DevKit** | devkit.tools / devkit.io | Tydligt dev-fokus men "kit" antyder bredare |
| 2 | **ToolForge** | toolforge.io | "Forge" = bygga/skapa. Bredare än bara dev |
| 3 | **Utilify** | utilify.io | "Utility" + "-ify". Modern, brett |
| 4 | **QuickKit** | quickkit.io | Betonar hastighet |
| 5 | **NeatTools** | neattools.io | "Neat" = prydligt. Differentierar från röriga konkurrenter |
| 6 | **OneKit** | onekit.io | "One kit for everything" |
| 7 | **Craftkit** | craftkit.io | "Craft" = kvalitet/hantverk |
| 8 | **ZapTools** | zaptools.io | "Zap" = snabbt/elektriskt |
| 9 | **Tinkerlab** | tinkerlab.io | "Tinker" = experimentera, "lab" = verkstad |
| 10 | **PixelForge** | pixelforge.io | Funkar bra för media-tools + dev |

**Rekommendation:** Kolla tillgänglighet med `check_domain_availability_and_price` via Vercel MCP. Favoriter: **ToolForge**, **Utilify**, **QuickKit**.

---

## 7. Tidslinje (3h/dag, 12 veckor)

### Vecka 1-2: Foundation + Första 3 Verktygen

- [x] Research & strategi (denna rapport)
- [ ] Next.js boilerplate med App Router
- [ ] Supabase auth (magic link + GitHub)
- [ ] Grundläggande layout (header, footer, sidebar, dark mode)
- [ ] Tool-ramverk (en fil = ett verktyg)
- [ ] JSON Formatter, UUID Generator, Base64 — deploya till Vercel
- [ ] SEO-grunderna: sitemap, robots.txt, structured data

### Vecka 3-4: AI & HF-Integration + 5 Verktyg Till

- [ ] Claude API-proxy (`/api/ai/claude`)
- [ ] HF Spaces-proxy (`/api/ai/huggingface`)
- [ ] Usage tracking (Supabase)
- [ ] Background Remover, OCR, Regex + AI Builder
- [ ] Privacy Policy Generator, AI Image Generator

### Vecka 5-6: Monetisering + 4 Verktyg

- [ ] Stripe Checkout + webhooks
- [ ] Pro-plan gating (usage limits, kvalitetsgating)
- [ ] Customer Portal
- [ ] Text-to-Speech, Cron Generator, Color Palette, QR Code

### Vecka 7-8: Expansion + Polish

- [ ] Hash Generator, Image Upscaler, SQL Formatter, Diff Checker
- [ ] SEO-content: skriv djupcontent för alla 16 verktyg
- [ ] Internal linking-system
- [ ] Performance-optimering

### Vecka 9-10: Fler Verktyg + Iteration

- [ ] JWT Decoder, Lorem Ipsum, Markdown-to-HTML, Photo Restoration
- [ ] A/B-testa konverterings-CTA:er
- [ ] Analytics (PostHog eller liknande)

### Vecka 11-12: Growth + Scale

- [ ] API-access för Pro-användare
- [ ] Batch-bearbetning för Business-tier
- [ ] Product Hunt-lansering
- [ ] Utvärdera och planera nästa 20 verktyg

---

## 8. Revenue-projektion

### Konservativ (1% konvertering, bara organisk trafik)

| Period | Fria användare | Betalande | MRR | Kumulativ intäkt |
|--------|---------------|-----------|-----|------------------|
| Månad 1 | 500 | 5 | $45 | $45 |
| Månad 3 | 5,000 | 50 | $450 | $1,000 |
| Månad 6 | 20,000 | 200 | $1,800 | $5,000 |
| Månad 12 | 80,000 | 800 | $7,200 | $30,000 |

### Realistisk (2.5% konvertering, SEO börjar slå igenom)

| Period | Fria användare | Betalande | MRR | Kumulativ intäkt |
|--------|---------------|-----------|-----|------------------|
| Månad 1 | 1,000 | 10 | $90 | $90 |
| Månad 3 | 10,000 | 250 | $2,250 | $4,500 |
| Månad 6 | 40,000 | 1,000 | $9,000 | $25,000 |
| Månad 12 | 150,000 | 3,750 | $33,750 | $150,000 |

### Optimistisk (4% konvertering, viral hit + stark SEO)

| Period | Fria användare | Betalande | MRR | Kumulativ intäkt |
|--------|---------------|-----------|-----|------------------|
| Månad 1 | 3,000 | 30 | $270 | $270 |
| Månad 3 | 30,000 | 1,200 | $10,800 | $20,000 |
| Månad 6 | 100,000 | 4,000 | $36,000 | $120,000 |
| Månad 12 | 500,000 | 20,000 | $180,000 | $700,000 |

**Not:** Media-tools (bakgrundsborttagning, TTS, bildgen) förväntas stå för ~60-70% av volymen men dev-tools förväntas ha högre konverteringsrat (3-5% vs 1-2% för media).

---

## 9. HF-beroenderisk & Fallback

### Riskscenario → Åtgärd

| Scenario | Sannolikhet | Åtgärd |
|----------|------------|--------|
| En specifik Space går ner tillfälligt | HÖG | Graceful degradation-UI + "Tjänsten är tillfälligt otillgänglig, försök igen" |
| HF ändrar gratis-tier-gränser | MEDEL | Migrera till self-hosted Docker eller Replicate.com (betala per anrop) |
| HF tar bort gratis compute helt | LÅG | Migrera till Railway/Fly.io med egna GPU:er. Alternativt: Replicate, Banana.dev |
| Cold start > 60 sekunder | HÖG | Implementera "keep-alive" pings var 30:e minut via cron job |
| Kvaliteten sjunker efter modelluppdatering | MEDEL | Pinna specifika Space-versioner, testa kvalitet regelbundet |

### Arkitekturprincip

**HF Spaces = enhancement layer, inte kärna.**

- Alla client-side-verktyg fungerar utan HF
- AI-media-verktyg har alltid en fallback-UI
- Proxyn i `/api/ai/huggingface` abstraherar bort HF — vi kan byta backend utan att ändra frontend
- Cacha HF-resultat aggressivt (t.ex. samma bakgrundsborttagning behöver inte köras 2x)

---

## Slutsats

**Vi bygger.** Marknaden är validerad, kostnadsstrukturen är exceptionell, och gapet i marknaden är tydligt. Vårt mål: bli "Vercel of dev tools" — ta det som finns i fula, fragmenterade, eller betalda former och gör det vackert, snabbt, gratis, och AI-förstärkt.

**Nästa steg:** Fas 3 — Arkitektur & Boilerplate. Vi sätter upp Next.js, Supabase, och bygger de första 8 verktygen.
