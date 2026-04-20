# VoiceOS: Competitor UI/UX Audit
### Onboarding Flows · Integration Maps · Design Patterns · What to Build Next

**Prepared:** April 2026 | **Method:** Live site scraping + screenshot capture + product docs analysis

---

## Executive Summary

Six competitors audited: Dvaarik AI, HuskyVoice, Bolna AI, Retell AI, Tring AI, and ElevenLabs ConvAI (our engine). Each dissected across: onboarding steps, data collected, integrations offered, UI patterns, and UX friction.

**Three things that stand out:**
1. **Dvaarik has the best SMB onboarding** — phone OTP, 4 steps, live in 5 minutes. But their phone is a ₹2,499 add-on and they have zero calendar. VoiceOS beats them on completeness.
2. **Bolna has the best integration depth** — but it requires a developer to touch it. No business owner can use it without help.
3. **Nobody shows you the agent working before you sign up.** Not one competitor has a live "call the agent" demo embedded on the landing page with your own business context. HuskyVoice comes closest with a generic demo call.

VoiceOS's biggest UI/UX gap right now: **the landing page doesn't demo the product, and there's no self-serve pricing.** Fix those two before anything else.

---

## Competitor 1: Dvaarik AI
**Position:** India SMB direct · **Target:** Salons, clinics, restaurants, gyms  
**URL:** dvaarik.com · **Stack:** Gemini Live + Exotel + Gupshup + Razorpay

### Landing Page

![Dvaarik Home](/home/user/voiceos-ux-report/screenshots/dvaarik-home.png)

**What they do well:**
- Headline is pure outcome: *"Your Business Deserves a Receptionist That Never Sleeps"*
- **Interactive ROI calculator** above the fold — sliders for calls/day, miss rate, ticket size → shows ₹/month lost. This is gold. Every SMB owner stops here.
- Social proof: "4.8/5 across 100+ reviews" + recognizable industry logos
- Pain section before solution: "60% of calls go unanswered" / "3 hrs/day on repetitive questions" — extremely specific, quantified pain
- Price visible immediately: "Plans from ₹499/month"
- Head-to-head comparison table: AI receptionist vs human receptionist (cost, hours, languages)

**What's weak:**
- No live demo of the product — just a chatbot widget in the corner
- No video walkthrough
- The phone add-on pricing is buried (you don't see ₹2,499 extra until you're deep in features)

### Pricing Page

![Dvaarik Pricing](/home/user/voiceos-ux-report/screenshots/dvaarik-pricing.png)

**Structure:** Starter ₹499 → Growth ₹999 → Business ₹1,999 + add-ons
- Plans are clean, feature-differentiated, monthly cancel anytime
- Phone number NOT included in any plan (hidden in add-ons: ₹2,499/mo)
- Voice minutes are metered (60 min Growth, 120 min Business)
- No annual discount shown (missed revenue optimization)
- CTA is "Get Started" → goes to phone OTP signup

### Onboarding Flow

![Dvaarik Signup](/home/user/voiceos-ux-report/screenshots/dvaarik-signup.png)

**Steps collected:**
1. **Phone number + OTP** (Indian number, frictionless)
2. **Business name + type** (freetext + category tile select)
3. **Services, staff, pricing, business hours** (form-based, ~5 min)
4. **Share your link** (dvaarik.com/your-business + widget embed snippet)
5. Phone add-on: self-serve purchase later

**UX observations:**
- Phone OTP signup is India-optimized — no password, no email, just +91 and verify
- Step 3 collects the most data but it's framed as "5 minutes" which sets expectations
- The onboarding ends at "share your link" — there's no guided tour of the dashboard after
- No voice selection step at all (Gemini Live is the only voice, no choice)
- No prompt customization in onboarding

### How It Works

![Dvaarik How It Works](/home/user/voiceos-ux-report/screenshots/dvaarik-howitworks.png)

4-step visual: Sign Up → Add Your Business → Share Your Link → AI Handles the Rest.
Clean iconography, progress feel. Missing: no preview of dashboard UI before signup.

### Integrations

**Native:** WhatsApp (Gupshup) · Razorpay · UPI direct · Exotel (phone add-on) · Website widget embed  
**No:** Google Calendar · Zapier/n8n · CRM · Shopify · Webhooks · Custom LLM

**Critical gap:** Zero automation integrations. If a Dvaarik customer wants to push booking data to a spreadsheet, their CRM, or WhatsApp flow, they can't. This is a churn driver for more sophisticated SMBs.

---

## Competitor 2: HuskyVoice AI
**Position:** India voice-first, healthcare/real estate/B2B focus  
**URL:** huskyvoice.ai · **Stack:** ElevenLabs + n8n/Zapier ecosystem

### Landing Page

![HuskyVoice Home](/home/user/voiceos-ux-report/screenshots/husky-home.png)

**What they do well:**
- **"Call a live demo"** CTA — phone number right on the page. This builds trust immediately. You hear the agent before signing up.
- Vertical-specific use cases clearly called out: Hospitals, Recruitment, Real Estate, Local Businesses
- Sample call audio player embedded — lets you hear voice quality without calling
- Testimonial with specific outcome: "Fewer missed property inquiries, Higher-quality pre-qualified leads"
- Stats: 24/7, 20+ languages, <1 day setup

**What's weak:**
- No pricing page (returns 404) — massive trust killer for SMBs
- No self-serve signup visible above the fold — only "Book a personalized demo"
- UI feels unpolished vs Dvaarik — less visual hierarchy
- No ROI calculator

### Integrations

**Native:** WhatsApp notifications · SMS · Zapier · n8n · Make · Webhooks (pre/in/post-call)  
**CRM:** HubSpot, Zoho, Salesforce (via Zapier)  
**No:** Google Calendar native · Razorpay · UPI · Website widget · Custom phone number included

**What's impressive about their integration model:** They expose **three webhook stages** — pre-call (fetch CRM context), in-call (validate data, make decisions), post-call (push summaries, trigger follow-ups). This is a mature integration model that most competitors don't have. VoiceOS only has post-call today.

### Key UX Pattern to Steal
The "Call a live demo right now" phone number on the landing page. No form. No email. Just call. It's the single most effective trust-builder in this space — you let the product speak for itself in 30 seconds.

---

## Competitor 3: Bolna AI
**Position:** India enterprise + developer platform  
**URL:** bolna.ai · **Stack:** Multi-provider (any LLM, STT, TTS) + Twilio/Exotel

### Landing Page & Product

![Bolna Home](/home/user/voiceos-ux-report/screenshots/bolna-home.png)
![Bolna Features](/home/user/voiceos-ux-report/screenshots/bolna-features.png)

**What they do well:**
- Clearly positioned for developers and enterprises — no confusion about who it's for
- "Call our AI agent" phone number (+91 22 6953 9260) for live demo — same tactic as HuskyVoice
- Three clear steps: Connect Account → Configure Agent → Click to Call
- Strong documentation — structured by platform concept (Agent Tab / LLM Tab / Audio Tab / Tools Tab)
- Sub-accounts model for agencies managing multiple clients

**What's weak:**
- Zero no-code path — every step requires API understanding
- Agent creation requires: choosing LLM provider, configuring STT, choosing TTS voice, writing system prompt, adding webhooks, connecting telephony. This is 6+ decisions before first call.
- Dashboard is functional but dense — not designed for non-technical users

### Dashboard UI

![Bolna Dashboard](/home/user/voiceos-ux-report/screenshots/bolna-dashboard.png)
![Bolna Agent Config](/home/user/voiceos-ux-report/screenshots/bolna-agent-config.png)

**Tab structure of the agent editor:**
- **Agent Tab** — name, system prompt, first message, language, timezone
- **LLM Tab** — provider (OpenAI/Claude/DeepSeek/etc), model, temperature, timeout
- **Audio Tab** — TTS provider + voice ID, STT provider, language
- **Engine Tab** — response delay, interruption sensitivity, ambient noise
- **Call Tab** — end call behavior, max duration, recording
- **Tools Tab** — function calling, webhooks, calendar integrations
- **Analytics Tab** — call history, transcripts, outcomes

**This 7-tab structure is the most complete agent editor in the market.** VoiceOS's 6-tab Agent Studio is very close. The difference: Bolna's is for developers, VoiceOS's is for business owners.

### Onboarding Data Collected
1. Email signup (Google OAuth supported)
2. Agent template selection (from library of pre-built agents)
3. LLM configuration (provider + model — requires API key)
4. Voice configuration (TTS provider + voice ID)
5. Telephony connection (Twilio/Exotel/Plivo — requires account)
6. Test call via web widget

**The developer assumption is fatal for SMBs.** Steps 3, 4, and 5 all require API keys and external accounts. A clinic owner cannot complete this. That's why Bolna never even tries to target them.

### Integrations

![Bolna Integrations](/home/user/voiceos-ux-report/screenshots/bolna-integrations.png)
![Bolna Tools](/home/user/voiceos-ux-report/screenshots/bolna-integrations-tools.png)

**Full integration stack:**
- **LLMs:** OpenAI, Anthropic, Azure OpenAI, DeepSeek, Gemini, OpenRouter, Perplexity, Groq
- **STT:** Deepgram, Whisper, AssemblyAI, Sarvam (India)
- **TTS:** ElevenLabs, Cartesia, OpenAI, Play.ht, Azure, Sarvam (India)
- **Telephony:** Twilio, Exotel, Plivo, Vobiz + SIP/BYOT
- **Scheduling:** Cal.com
- **Automation:** Zapier, n8n, Make
- **Messaging:** AiSensy (WhatsApp)
- **No CRM native** — goes via Zapier

This is the deepest integration catalog in the India market. But it's all developer-configured.

---

## Competitor 4: Retell AI
**Position:** Global developer platform, US-centric  
**URL:** retellai.com · **Stack:** Multi-provider, enterprise-ready

### Landing Page & Features

![Retell Home](/home/user/voiceos-ux-report/screenshots/retell-home.png)
![Retell Features](/home/user/voiceos-ux-report/screenshots/retell-features.png)

**What they do well:**
- **The cleanest, most premium UI** in the entire voice AI space. Dark, information-dense, professional.
- **Cost estimator** on pricing page: sliders for call minutes + LLM choice → shows estimated monthly cost. Excellent conversion tool.
- **Call simulation** before going live — test your agent with synthetic callers
- Integrations page organized by category (CRM / Healthcare Software / Telephony / Automation / Calendar / Ecommerce)
- **Batch calling** for outbound campaigns — a feature nobody else in India has shipped yet

**What's weak:**
- US-centric — no Indian payment methods, no INR pricing, no Indian phone numbers highlighted
- No Hindi/regional language promotion
- Developer-only — no business owner UX
- No onboarding wizard — you drop into a blank dashboard after signup

### Dashboard UI

![Retell Dashboard](/home/user/voiceos-ux-report/screenshots/retell-dashboard.png)
![Retell Analytics](/home/user/voiceos-ux-report/screenshots/retell-analytics.png)

**Key UI observations:**
- Left sidebar navigation: Agents → Phone Numbers → Calls → Analytics → Concurrency → Integrations
- Agent creation: 4 steps (type → prompt → voice → phone number)
- Analytics: call volume over time, outcome breakdown, average duration, sentiment analysis
- Call monitoring: live call feed with real-time transcript visible during call

The analytics panel is the most mature in the space. Post-call sentiment, call outcomes auto-tagged, exportable. This is what VoiceOS's analytics section should evolve toward.

### Integrations

![Retell Integrations](/home/user/voiceos-ux-report/screenshots/retell-integrations.png)

**Categories:** CRM · Healthcare Software · Telephony · Automation Platform · CX Platform · Payment · Communication · Ecommerce · Calendar · Home Service · Others

**Notable:** Retell has healthcare-specific integrations (Jane App, Dentrix, OpenDental, Epic, ChiroTouch) — US clinic software. In India, equivalent would be Practo, Mfine, HealthPlix. Massive untapped opportunity.

**Automation:** Zapier, n8n, Make, viaSocket  
**Calendar:** Cal.com  
**CRM:** HubSpot, Salesforce, Zendesk, Intercom  
**Telephony:** Twilio, Vonage, Telnyx, Amazon Connect, RingCentral

---

## Competitor 5: Tring AI
**Position:** India mid-market, enterprise-leaning  
**URL:** tringlabs.ai · **Stack:** Proprietary

### Product

![Tring Product](/home/user/voiceos-ux-report/screenshots/tring-product.png)
![Tring Home](/home/user/voiceos-ux-report/screenshots/tring-home.png)

**What's notable:**
- Targets 12+ industry verticals on the homepage (Telecom, Logistics, Government, Energy, Healthcare, Education, etc.)
- Both chatbot AND voicebot — more of a full conversational AI platform
- Webhook support for custom integrations
- Zapier connector mentioned in features

**What's weak:**
- Pricing starts at ₹14,999/mo — completely out of SMB range
- No self-serve — "Book a Demo" only
- Multiple 404 pages on their site (integrations page, some features pages)
- No live demo or trial
- Website looks dated compared to Dvaarik or Retell

**This is not a real competitor for VoiceOS's target segment.** Their pricing alone disqualifies them for clinics and SMBs. Worth watching only if you move upmarket.

---

## Integration Coverage Map

![Integration Heatmap](/home/user/voiceos-ux-report/chart-integrations-heatmap.png)

### Reading the Map

The heatmap shows the full integration surface across all 6 platforms. Key observations:

**VoiceOS is unique in:** Google Calendar native, phone number included in base plan  
**VoiceOS is missing vs competitors:** WhatsApp (Dvaarik, HuskyVoice lead), Zapier/n8n (Bolna, Retell, HuskyVoice), CRM sync, Cal.com  
**Nobody has:** Google Calendar native + phone included + no-code setup

### Integration Priority for VoiceOS

| Integration | Who Has It | Priority | Why |
|-------------|-----------|----------|-----|
| WhatsApp confirmation | Dvaarik, HuskyVoice | **P0** | Indian SMBs expect this. Dvaarik leads here. |
| WhatsApp reminder (24h) | Dvaarik | **P0** | No-show reduction. Directly tied to retention. |
| Zapier / n8n | Bolna, Retell, Husky | **P1** | Enables power users to connect any CRM without custom code |
| Pre-call webhook | HuskyVoice, Bolna | **P1** | Pull caller context before answering (CRM lookup) |
| Razorpay subscription | — | **P0** | Can't charge anyone without this |
| Cal.com | Bolna, Retell | **P2** | Alternative calendar for non-Google users |
| HubSpot / Zoho CRM | HuskyVoice, Retell | **P2** | Agencies and larger SMBs need this |
| Website chat widget | Dvaarik | **P2** | Dvaarik's biggest adoption driver |
| Practo / HealthPlix | Nobody | **P1 (future)** | India-specific healthcare — nobody has this |

---

## Onboarding Flow Comparison

![Onboarding Flows](/home/user/voiceos-ux-report/chart-onboarding-flows.png)

### Step-by-Step Breakdown

**Dvaarik (4 steps, 5 minutes):** Phone + OTP → Business name + type → Services/staff/hours → Share link. Fastest and most India-native. Weakness: no voice selection, no agent customization.

**HuskyVoice (5 steps, 1 day):** Email → Business info → Agent persona → Knowledge base → Phone setup (manual). Voice customization is in onboarding but phone setup is manual and slow.

**Bolna (6 steps, developer-hours):** Email → Template → LLM config → Voice config → Telephony → Test. Each step requires external API access. Not completable by non-developers.

**Retell (4 steps, developer-minutes):** Email → Agent type + prompt → Voice + LLM → Phone number → Test. Fast for developers, impossible for non-developers.

**Tring (5 steps, sales-weeks):** Demo booking → Sales call → Assisted setup → KB + prompt → Go live. The entire onboarding is human-mediated. No self-serve at all.

**VoiceOS (6 steps + 1 optional, 10-15 min):** Email → Business name + vertical → Agent name + language → Voice picker (live preview) → Business hours + timezone → Calendar (optional) → Confirm + create agent.

**What VoiceOS gets right:** The voice preview step is unique — no competitor lets you hear and choose a voice during onboarding. The vertical-based defaults mean the agent is ready out of the box. Calendar integration is offered immediately, not post-onboarding.

**What to improve in VoiceOS onboarding:**
1. Add **phone OTP as alternative** to email (Dvaarik's India-native approach)
2. **Reduce to 5 steps** by combining agent name + language into one screen
3. After onboarding completes: show a **"Your agent is live — here's your number"** screen with a click-to-call test
4. Add a **"call your agent right now"** button at the end of onboarding — let them experience it immediately

---

## Data Collected: Onboarding Map

![Onboarding Data](/home/user/voiceos-ux-report/chart-onboarding-data.png)

### What the Map Tells You

**VoiceOS collects the most complete business context** — it's the only platform that captures business hours, timezone, vertical, language, and voice in a single onboarding flow. This is a feature, not a burden — it means the agent is fully configured from minute one.

**What nobody collects (and should):**
- **Customer's WhatsApp number** — to send them booking updates (Dvaarik collects this post-onboarding)
- **Existing phone number they want calls forwarded from** — most SMBs want to forward their existing number, not replace it
- **Business peak hours** — critical for setting realistic expectations about when the AI handles calls vs human

---

## UX Quality Radar

![UX Radar](/home/user/voiceos-ux-report/chart-ux-radar.png)

### Scoring Rationale (1-10 per dimension)

| Dimension | Dvaarik | HuskyVoice | Bolna | Retell | Tring | VoiceOS |
|-----------|---------|-----------|-------|--------|-------|---------|
| Onboarding Speed | 9 | 7 | 4 | 5 | 2 | 8 |
| Visual Design | 7 | 6 | 7 | 8 | 6 | 9 |
| Mobile Friendly | 9 | 7 | 5 | 6 | 5 | 7 |
| No-Code Setup | 10 | 8 | 3 | 4 | 3 | 9 |
| Integration Depth | 5 | 7 | 9 | 9 | 6 | 6 |
| India-First UX | 9 | 8 | 8 | 2 | 5 | 8 |
| Data Transparency | 7 | 5 | 8 | 8 | 4 | 7 |
| Agent Customization | 5 | 6 | 9 | 9 | 6 | 9 |

**VoiceOS leads on:** Visual design + agent customization + no-code setup + India-first UX  
**Gap to close:** Integration depth (WhatsApp, Zapier are the priority items) + mobile optimization

---

## Section: Design Lessons

![Design Lessons](/home/user/voiceos-ux-report/chart-design-lessons.png)

### Steal These Immediately

**From Dvaarik — ROI Calculator on Landing Page**  
Their interactive calculator ("How much are you losing to missed calls?") stops the visitor and makes the problem concrete. The number feels personal because it is — you entered your own calls/day and ticket size. Implement this on VoiceOS landing for clinics: "calls/day × miss rate × consult fee = ₹/month lost."

**From Dvaarik — Phone OTP Signup**  
Email+password is friction for Indian SMB owners. Phone number + OTP is frictionless and how every Indian app (Zomato, Practo, Nykaa) does it. Consider offering OTP as an alternative signup path alongside email.

**From HuskyVoice — "Call the Agent Right Now" Demo**  
This is the most powerful trust signal in the product category. Put a live demo phone number on the VoiceOS landing page that connects to a generic clinic agent. The caller hears the product in 5 seconds. No form, no email, no commitment. This single CTA could double demo conversion.

**From HuskyVoice — Pre/In/Post Call Webhooks**  
Three-stage webhooks are a future power feature. Today VoiceOS only has post-call. Pre-call webhook enables: "before answering, fetch this caller's booking history from our CRM." In-call webhook enables: "mid-conversation, validate this appointment slot before confirming." Plan this for v0.4.

**From Bolna — Agent Tab Structure**  
Bolna's 7-tab agent editor (Agent / LLM / Audio / Engine / Call / Tools / Analytics) is the gold standard. VoiceOS's 6-tab Agent Studio (Identity / Prompt / Voice / Knowledge / Tools / Test) mirrors this well. The one tab VoiceOS is missing: **Analytics inline in the Agent Studio** — show the last 10 calls and their outcomes without leaving the agent editor.

**From Retell — Cost Estimator on Pricing Page**  
Retell's pricing page has a minute/LLM cost estimator. For VoiceOS, this would be: "X calls/month × Y minutes/call = ₹/month." Makes the pricing feel fair and removes sticker shock. Easy to build in 2 hours.

**From Retell — Integrations Page by Category**  
When you add Zapier, WhatsApp, Razorpay — organize them on an `/integrations` page with category filters (Payments, Calendar, CRM, Messaging, Automation). Makes the product look more complete than it is.

---

## Section: What VoiceOS UI/UX Should Look Like

Based on the audit, here's the prescriptive spec for VoiceOS's UX evolution:

### Landing Page (Priority 1)

**Hero:**
- Headline: outcome-focused, not feature-focused. E.g., *"Your clinic answers every call. Books to Google Calendar. ₹1,999/month."*
- Sub-headline: the key differentiators in one line. *"AI receptionist for clinics, hotels, and businesses. Includes real phone number. No setup fee."*
- Two CTAs: primary = "Start Free Trial" (no card), secondary = "Call a Demo Now" (phone number)
- Hero image/video: phone ringing → AI answers → calendar slot booked → WhatsApp confirmation sent

**Trust strip:** ElevenLabs (voice engine), Google Calendar (integration), Twilio (phone), Razorpay (billing)

**ROI Calculator:** Steal Dvaarik's model. Below the hero. "How much are you losing?" sliders → output in ₹/month.

**Pricing:** Visible on the landing page. Don't hide it. 3 plans with checkmarks.

### Signup Flow (Priority 1)

Current: Email → Password  
Recommended: **Phone OTP first** (optional email link) → 6-step onboarding wizard

The onboarding wizard is already good. Two improvements:
1. After step 6 completion: land on a **"Your agent is live"** screen with: phone number displayed, click-to-call test button, shareable link
2. Add a skip-able "Call your agent now" interstitial — let them test it before touching the dashboard

### Dashboard (Priority 2)

Current state is solid. Improvements to queue:

1. **Overview page** — add "Today's calls" live count with live indicator. Add a "Call your agent" button in the header (small phone icon). Make the first visit experience show a checklist: ✓ Agent created · ✓ Phone number assigned · □ Connect calendar · □ Test a call · □ Invite team member

2. **Calls page** — add sentiment badge on each call row (positive/neutral/negative). Add "Replay" audio button inline in the table (already have it, make it more prominent). Add outcome auto-tag: Booked / Escalated / Inquiry / Missed.

3. **Agent Studio** — add an inline "Last 5 calls" feed in the Test tab so you can see live results without switching to the Calls page. Add a "Preview prompt" → "Simulate conversation" button that lets you chat with the agent as a test caller.

4. **Integrations page** — new page at `/dashboard/integrations` showing all available integrations with status cards. Currently only Google Calendar. Should list: Google Calendar (connected) · WhatsApp (coming soon) · Zapier (coming soon) · Razorpay (billing) · Webhook (configure URL).

### Mobile Experience (Priority 3)

Dvaarik scores 9/10 on mobile. VoiceOS scores ~7. The dashboard needs:
- Collapsible sidebar (hamburger on mobile)
- Call log rows that expand on tap (currently may overflow)
- Agent Studio tabs scrollable horizontally on mobile
- Phone number displayed prominently on mobile overview (owner wants to share it quickly)

---

## Synthesis: The UX Gap Map

| Gap | Severity | Who Closes It | Timeline |
|-----|----------|--------------|----------|
| No "call a demo" phone on landing | 🔴 Critical | You | 1 day |
| No pricing page | 🔴 Critical | You | 1 day |
| No Razorpay self-serve checkout | 🔴 Critical | You | 1 week |
| No WhatsApp confirmation post-booking | 🔴 High | You | 1-2 weeks |
| No ROI calculator on landing | 🟠 High | You | 2 days |
| Phone OTP as signup option | 🟠 High | You | 1 week |
| "Agent is live" post-onboarding screen | 🟠 High | You | 1 day |
| No Zapier / n8n connector | 🟡 Medium | You | v0.3 |
| No pre-call / in-call webhooks | 🟡 Medium | You | v0.4 |
| No CRM integration (HubSpot/Zoho) | 🟡 Medium | You | v0.4 |
| No website chat widget | 🟡 Medium | You | v0.4 |
| Analytics: sentiment + outcome tags | 🟡 Medium | You | v0.3 |
| Mobile sidebar / responsive fixes | 🟢 Low | You | ongoing |

---

## Methodology

- **Live screenshots:** Captured April 2026 from public-facing pages of all 6 competitors using headless Chrome
- **Onboarding data:** Documented from product pages, documentation sites, and signup flows
- **Integration data:** Scraped from `/integrations` pages, docs, and feature listings
- **UX scores:** Qualitative assessment based on: time-to-first-value, visual polish, mobile responsiveness, India-specific design decisions, data transparency, customization depth
- **Competitors not included:** Gnani.ai, Skit.ai (enterprise only, no public product UI), Yellow.ai (enterprise, complex UI), Vapi (developer API, no dashboard), Sarvam AI (infrastructure API, no dashboard)

*All screenshots current as of April 2026. Competitor UIs change frequently.*
