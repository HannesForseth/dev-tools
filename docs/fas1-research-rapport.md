# Fas 1: Research & Validering — Komplett Rapport

*Sammanställd 2026-04-04. Baserad på träningsdata (maj 2025), HF MCP-verifiering, och marknadsanalys.*

---

## 1. Konkurrentanalys

### Sammanfattning

| Sajt | Verktyg | Trafik (est.) | Monetisering | Design | Svaghet |
|------|---------|---------------|-------------|--------|---------|
| SmallSEOTools | ~250+ | 30-50M/mo | Aggressiva annonser | 3/10 | Spammigt, repellerar utvecklare |
| 10015.io | ~100-120 | 500K-1M/mo | Minimal | 7/10 | Grunda verktyg, svag differentiering |
| transform.tools | ~30-40 | 200-400K/mo | Ingen | 8/10 | Smal nisch, bara transformeringar |
| DevUtils.com | ~40+ | 100-200K/mo | $29 engångsköp (macOS) | 8/10 | Bara macOS, betalmodell begränsar adoption |
| it-tools.tech | ~80-90 | 300-500K/mo | Ingen (open source) | 7.5/10 | Ingen SEO-strategi (SPA), ingen intäktsmodell |
| ray.so | 1 | 1-2M/mo | Marknadsföring för Raycast | 9/10 | Enproduktsverktyg |
| carbon.now.sh | 1 | 1-2M/mo | Open source | 7.5/10 | Åldras visuellt |
| Omatsuri | ~12-15 | 50-100K/mo | Ingen | 8/10 | För få verktyg |

### Övriga viktiga konkurrenter

| Sajt | Trafik (est.) | Nyckelinsikt |
|------|---------------|-------------|
| Regex101 | 3-5M/mo | Guldstandard för single-tool-djup |
| CyberChef | 2-3M/mo | Kedjebart recipe-koncept, unik |
| JSON Crack | 1-2M/mo | Viral framgång via JSON-visualisering |
| JWT.io | 2-3M/mo | Verktyg-som-marknadsföring (Auth0) |
| Crontab.guru | 1-2M/mo | En sida, ett verktyg, massiv trafik |
| Excalidraw | 5-10M/mo | Bevisar att ett utmärkt verktyg kan dominera |

### Nyckelmönster

1. **Ingen sajt kombinerar bredd + djup + design.** Det finns ett tydligt gap.
2. **SEO är eftersatt** hos nästan alla — de flesta är SPA:er utan per-verktyg-SEO.
3. **AI-integrering saknas** nästan helt bland befintliga tool-sajter.
4. **Design är en vallgrav** — ray.so vs carbon.now.sh visar att det vackrare alternativet vinner.
5. **Viral output-loop** driver tillväxt — delbart output (kodbilder, diagram) = gratis marknadsföring.

---

## 2. SEO-volymanalys

### Dev Tools Keywords

| Keyword | Volym (est.) | KD | CPC | Topp-sajter |
|---------|-------------|-----|------|-------------|
| json formatter online | ~200K | 35 | $0.30 | jsonformatter.org, codebeautify.org |
| regex tester online | ~150K | 30 | $0.20 | regex101.com, regexr.com |
| cron expression generator | ~90K | 25 | $0.40 | crontab.guru, cronmaker.com |
| jwt decoder online | ~80K | 20 | $0.50 | jwt.io, token.dev |
| base64 decode online | ~180K | 30 | $0.15 | base64decode.org |
| uuid generator | ~200K | 30 | $0.20 | uuidgenerator.net |
| qr code generator free | ~500K | 50 | $1.50 | qr-code-generator.com |
| privacy policy generator free | ~100K | 40 | $3.00 | termsfeed.com |
| color palette generator | ~200K | 40 | $0.50 | coolors.co |
| markdown to html converter | ~40K | 20 | $0.15 | markdowntohtml.com |
| sql formatter online | ~80K | 25 | $0.30 | sqlformat.org |
| diff checker online | ~100K | 30 | $0.20 | diffchecker.com |
| hash generator online | ~60K | 20 | $0.25 | passwordsgenerator.net |
| lorem ipsum generator | ~150K | 30 | $0.15 | lipsum.com |
| og image generator | ~15K | 15 | $0.60 | Nischad, låg konkurrens |

### AI Media Tools Keywords

| Keyword | Volym (est.) | KD | CPC | Topp-sajter |
|---------|-------------|-----|------|-------------|
| remove background from image free | ~600K | 55 | $1.00 | remove.bg, canva.com |
| image to text converter online | ~250K | 40 | $0.40 | onlineocr.net |
| ai image generator free | ~500K | 60 | $1.50 | craiyon.com, bing.com/create |
| text to speech online free | ~300K | 45 | $0.80 | ttsreader.com |
| remove object from photo free | ~200K | 45 | $1.20 | cleanup.pictures |
| upscale image free online | ~150K | 40 | $0.80 | bigjpg.com |
| ai image editor free | ~120K | 50 | $1.50 | canva.com |
| photo restoration online free | ~80K | 35 | $0.70 | hotpot.ai |

### Slutsats

- **AI media-tools har 2-10x volymen** jämfört med dev-tools men också högre konkurrens.
- **Bäst risk/reward-ratio:** uuid generator, json formatter, cron generator, image-to-text OCR.
- **Lägst konkurrens:** og image generator (KD 15), jwt decoder (KD 20), hash generator (KD 20).
- **Högst kommersiellt värde:** privacy policy generator ($3 CPC), QR code ($1.50), AI image tools ($1-1.50).

---

## 3. Monetiseringsanalys

### Beprövade modeller

| Modell | Pris | Exempel | Konvertering |
|--------|------|---------|-------------|
| Freemium SaaS | $8-12/mo | Raycast, Linear | 2-4% |
| Engångsköp | $14-29 | DevUtils, Dash | Högre initial men lägre LTV |
| Usage/credits | Variabel | Remove.bg, OpenAI | Skalbar |
| Årsbetalning | $79-99/år | Standardrabatt 2 mån gratis | Bäst LTV |

### Konkurrentpriser (AI media)

| Tjänst | Gratis | Entry | Mid |
|--------|--------|-------|-----|
| Remove.bg | Lågupplöst | $9.99/mo (40 credits) | $29.99/mo |
| ElevenLabs | 10K tecken/mo | $5/mo | $22/mo |
| Photoroom | Vattenmärkt | $9.99/mo | $24.99/mo |
| Clipdrop | Daglig gräns | $9/mo | API usage-based |
| Canva | Begränsade features | $13/mo | $10/person/mo |

### Rekommenderad prisstruktur

| Tier | Pris | Innehåll |
|------|------|----------|
| **Free** | $0 | Alla verktyg, 10-25 AI-anrop/dag, lågupplöst mediaverktyg |
| **Pro** | $9/mo ($79/år) | Obegränsat, HD-output, inget vattenmärke, API-access |
| **Business** | $19/mo ($149/år) | Högre API-gränser, batch, prioritet, kommersiell licens |

### Intäktsprognos (konservativ)

| Tidsperiod | Gratisanvändare | Konvertering | Betalande | MRR |
|------------|----------------|-------------|-----------|-----|
| Månad 3 | 5,000 | 2% | 100 | $900 |
| Månad 6 | 25,000 | 2.5% | 625 | $6,250 |
| Månad 12 | 100,000 | 3% | 3,000 | $33,000 |

---

## 4. AI-differentiering

### Var AI ger genuint mervärde

| Funktion | Värde | Kostnad/anrop (Haiku) |
|----------|-------|----------------------|
| Naturligt språk → regex | HÖGT | ~$0.0006 |
| Regex-förklaring | HÖGT | ~$0.0006 |
| Felmeddelande-förklarare | HÖGT | ~$0.001 |
| Cron från beskrivning | HÖGT | ~$0.0004 |
| Mock data-generator | MEDEL | ~$0.002 |
| SQL från beskrivning | MEDEL | ~$0.0008 |
| Kodgranskning | MEDEL | ~$0.006 (Sonnet) |

### Var AI INTE tillför värde

- JSON formatting (deterministiskt)
- Base64 encode/decode (algoritmiskt)
- Färgkonvertering (matematik)
- URL-encoding (simpel kodning)
- Timestamp-konvertering (matematik)

### Kostnadsprojektioner (Haiku)

| Månatliga AI-anrop | Kostnad |
|-------------------|---------|
| 10,000 | $4-16 |
| 100,000 | $40-160 |
| 1,000,000 | $400-1,600 |

---

## 5. Riskanalys

### Riskmatris

| Risk | Sannolikhet | Konsekvens | Mitigering |
|------|------------|-----------|-----------|
| Google HCU-penalisering | MEDEL | HÖG | Genuint användbara verktyg + djupt expertcontent per sida |
| AI-kostnader äter marginalen | LÅG | MEDEL | Haiku, caching, rate limits, user-triggered only |
| Stor aktör (Google/GitHub) lanserar samma sak | HÖG | MEDEL | SEO-equity, specialiserad UX, ingen inloggning krävs |
| HF Spaces instabilitet | MEDEL | MEDEL | Client-side som kärna, HF som enhancement, fallback-UX |
| HF ändrar villkor/prissättning | MEDEL | HÖG | Docker-portabla Spaces, migreringsplan till Railway/Fly.io |

### HF Spaces begränsningar

- **Gratis tier:** 2 vCPU, 16 GB RAM, 50 GB disk
- **Sover efter ~48h** inaktivitet → cold start 30s-5min
- **Ingen SLA**, ingen redundans
- **Rate limits:** Ej publicerade, men free Spaces deprioriteras vid hög last

---

## 6. HF Spaces — Tillgängliga AI-modeller

### Verifierade Spaces (parametrar testade)

| Space | Funktion | Input | Output | Verktygs-potential |
|-------|----------|-------|--------|-------------------|
| not-lain/background-removal | Bakgrundsborttagning | Bild-URL | Transparent PNG | HÖG — enorm sökvolym |
| evalstate/flux1_schnell | Bildgenerering (snabb) | Prompt, storlek | Bild | HÖG — viral potential |
| mcp-tools/FLUX.1-Krea-dev | Fotorealistisk bildgen | Prompt, storlek | Bild | MEDEL — nischad |
| mcp-tools/Qwen-Image | Bildgen (bra på text) | Prompt, aspect ratio | Bild | MEDEL |
| mcp-tools/DeepSeek-OCR-experimental | OCR | Bild-URL, modellstorlek | Text/Markdown | HÖG — bred publik |
| ResembleAI/Chatterbox | Text-till-tal | Text (max 300 tecken), röstref | Audio (wav) | HÖG — stor sökvolym |
| prithivMLmods/Photo-Mate-i2i | Bildredigering (8 LoRAs) | Bild + prompt | Redigerad bild | MEDEL |
| fffiloni/InstantIR | Bildrestaurering | Lågkvalitetsbild + prompt | Restaurerad bild | MEDEL |
| fffiloni/diffusers-image-outpaint | Outpainting | Bild + dimensioner + prompt | Utökad bild | LÅG — nischad |
| prithivMLmods/SAM3-Image-Segmentation | Objektdetektion | Bild + textquery | Segmenterad bild | LÅG |
| mcp-tools/FLUX.1-Kontext-Dev | Bildredigering med text | Bild + redigeringsprompt | Redigerad bild | MEDEL |
| zerogpu-aoti/wan2-2-fp8da-aoti-faster | Videogenerering | Bild + prompt | MP4-video | HÖG — wow-faktor |

### Upptäckta ytterligare MCP-Spaces

| Space | Kategori | Likes | Potential |
|-------|----------|-------|-----------|
| Fabrice-TIERCELIN/RealESRGAN | Bilduppskalning | 14 | HÖG — direkt tool |
| hf-audio/whisper-large-v3 | Transkribering | 820 | HÖG — speech-to-text |
| fffiloni/image-to-music-v2 | Musikgenerering | 567 | MEDEL — viral |
| ResembleAI/Chatterbox-Multilingual-TTS | TTS 23 språk | 382 | HÖG — bredare marknad |
| trellis-community/TRELLIS | 3D-modellering | 564 | MEDEL — nischad |
| Oysiyl/AI-QR-code-generator | AI QR-koder | 84 | HÖG — kombination av hög sökvolym + AI |
| mrfakename/Z-Image-Turbo | Bildgenerering (snabb) | 2777 | HÖG — alternativ bildgen |
| prithivMLmods/Multimodal-OCR3 | Multi-OCR | 68 | MEDEL — backup OCR |
| alexnasa/ltx-2-TURBO | Video + audio | 370 | MEDEL — video med ljud |
| TiberiuCristianLeon/GradioTranslate | Maskinöversättning | 4 | LÅG — Google Translate dominerar |

---

## 7. Go/No-Go — Preliminär bedömning

### GO. Här är varför:

1. **Validerad efterfrågan.** Befintliga sajter bevisar enorm trafik (regex101: 3-5M/mo, crontab.guru: 1-2M/mo). Marknaden existerar.

2. **Tydligt gap.** Ingen sajt kombinerar bredd + djup + design + AI + SEO. Vi kan vara den första.

3. **Hanterbara kostnader.** Client-side-verktyg = noll marginalkostnad. HF Spaces = gratis compute. Claude Haiku = $0.0004-0.002/anrop. 100% marginal på 80%+ av verktygen.

4. **Stark differentiering.** AI-förstärkta verktyg (regex, error explainer, cron) existerar knappt bland konkurrenterna.

5. **Skalbar monetisering.** $9/mo Pro-plan med 2-4% konvertering ger realistisk väg till $33K MRR vid 12 månader.

6. **Dubbel trafikstrategi.** Dev-tools för nischad high-intent + AI media-tools för volym breddar TAM enormt.

### Risker att hantera

- HF Spaces-beroende kräver fallback-plan
- Google HCU kräver genuint djupt content per sida
- AI-kostnader kräver caching + rate limiting från dag 1
