# 🚀 Luvora.love - Master Development Roadmap

## Phase 0: Project Genesis (Infrastructure)
*Goal: Establishing a professional-grade, sovereign development environment.*

- [x] **Task 0.1: Environment Scaffolding**
    - [x] Initialize project: `bun create next-app@latest . --typescript --tailwind --eslint`.
    - [x] Install UI Core: `bun add daisyui@latest lucide-react framer-motion`.
    - [x] Install Backend SDK: `bun add pocketbase`.
- [x] **Task 0.2: Theming & Visual Identity**
    - [x] Configure `tailwind.config.ts` with daisyUI themes (`cupcake` for Dawn, `luxury` for Night).
    - [x] Build `ThemeSwitcher.tsx`: A logic wrapper using `date-fns` to detect local time.

## Phase 1: Core Logic (The Engine)
*Goal: Building the deterministic message generation system.*

- [x] **Task 1.1: The Deterministic Algorithm**
    - [x] Create `lib/algo.ts` with a SHA-256 date-based hashing function.
    - [x] Logic: `const dailyIdx = Hash(Today) % PoolSize`.
- [x] **Task 1.2: Local Persistence Layer**
    - [x] Build `useLocalStorage` hook to store `partner_name` and `user_settings`.
    - [x] Implementation: Zero-database calls for free users to maintain VPS performance.
- [x] **Task 1.3: Content Seeding**
    - [x] Structure `messages.json` (as `pool.json`) with 300+ initial entries.
    - [x] Create `nicknames.json` (merged into `pool.json`) with 100+ "Ethereal" names.

## Phase 2: Frontend "Pro-Max" (The Interface)
*Goal: High-fidelity, mobile-first UI using daisyUI semantic components.*

- [x] **Task 2.1: The Main "Spark Card"**
    - [x] Design a `glassmorphism` card with daisyUI `card` and `shadow-2xl`.
    - [x] Implement animated text transitions using `framer-motion` for "The Daily Spark."
- [x] **Task 2.2: Interaction Design**
    - [x] "One-Tap Copy" button: Large, thumb-friendly, with daisyUI `btn-primary`.
    - [x] Browser Clipboard API integration + `navigator.vibrate([50])` for haptics.
- [x] **Task 2.3: Emotional Feedback**
    - [x] Build a daisyUI `toast` system: "Spark sent to Nova! 🚀"
    - [x] Implement "Specialness Counter": Animated ticker showing global usage stats.

## Phase 3: Sovereign Backend (PocketBase)
*Goal: Moving to a self-hosted database for authentication and premium data.*

- [x] **Task 3.1: Collection Architecture**
    - [x] Create `users` (id, email, partner_name, is_premium).
    - [x] Create `message_stats` (daily_clicks, total_shares).
- [x] **Task 3.2: Magic Link/OTP Authentication**
    - [x] Integrate PocketBase Auth Flow: OTP login logic.
- [x] **Task 3.3: Premium Logic Gate**
    - [x] Build atomic stats updates and secure Data Sync (DB > Local).

## Phase 3.5: Inclusivity Update (Role-Aware)
*Goal: Personalized messages based on recipient role (He/She/They).*

- [x] **Task 3.5.1: Database/Pool Expansion**
    - [x] Add `target` field to logic and PB schema.
    - [x] Populate `pool.json` with Masculine/Feminine variants.
- [x] **Task 3.5.2: Logic Refactor**
    - [x] Update `getDailySpark` to filter by `recipient_role`.
- [x] **Task 3.5.3: UI Toggle**
    - [x] Add Settings Cog to SparkCard to switch roles.

## Phase 4: Monetization & Exclusivity
*Goal: Converting visitors into paying "Heroes."*

- [x] **Task 4.1: The "Unique Seed" Algorithm**
    - [x] Logic: `PremiumIdx = Hash(UserUUID + Today) % PremiumPoolSize`.
- [x] **Task 4.2: Payment Gateway (Stripe/Lemon Squeezy)**
    - [x] Implement Webhook listener to update `is_premium` status in PocketBase.
- [x] **Task 4.3: The Upgrade Modal**
    - [x] Design a high-conversion daisyUI modal: "Don't be 1 of 14,000. Be 1 of 1."

## Phase 5: Automation (The "Lazy Hero" Tier)
*Goal: Scaling to high-ticket subscriptions with automated delivery.*

- [x] **Task 5.1: WhatsApp/Telegram Integration**
    - [x] Connect Meta Cloud API for WhatsApp messaging.
- [x] **Task 5.2: VPS Cron Engine**
    - [x] Setup Node-Cron job on VPS to pull unique messages and send at 07:00 AM local.
- [x] **Task 5.3: Viral Loop "Love Streak"**
    - [x] Build image generator (Canvas/HTML) for social media sharing.

## Phase 6: SEO & Organic Growth (The Traffic Engine)
*Goal: Creating a "Content Moat" to capture high-intent romantic search traffic.*

- [x] **Task 6.1: Programmatic SEO Architecture**
    - [x] Create dynamic routes: `src/app/sparks/[category]/page.tsx` (e.g., `/sparks/morning-messages-for-her`).
    - [x] Implement `generateStaticParams` to pre-render 50+ high-traffic category pages.
    - [x] Build a "Category Hero" component to display curated message previews.
- [x] **Task 6.2: Metadata & Structured Data**
    - [x] Implement dynamic `Metadata` API for unique titles/descriptions per category.
    - [x] Add **JSON-LD Schema** (CreativeWork/Message) to enable Google "Rich Snippets."
- [x] **Task 6.3: OpenGraph (OG) Automation**
    - [x] Integrate `@vercel/og` (Satori) to generate dynamic preview images for every SEO page and user streak.

## Phase 7: Management Hubs (The Business Layer)
*Goal: Providing tools for user self-service and administrative oversight.*

- [x] **Task 7.1: The User Command Center (`/dashboard`)**
    - [x] **Automation Hub:** UI to manage `morning_time`, `timezone`, and `messaging_id`.
    - [x] **Relationship Profile:** Section to update `partner_name` and `recipient_role`.
    - [x] **Streak History:** A grid view of previous sparks with a one-click "Re-send" button.
- [x] **Task 7.2: The Admin Cockpit (`/admin`)**
    - [x] **Financial Dashboard:** Real-time MRR and subscriber count via Lemon Squeezy API.
    - [x] **Content Management:** Custom CRUD interface for the PocketBase `messages` collection.
    - [x] **Broadcast Monitor:** Status table showing successful/failed automated sends.
- [x] **Task 7.3: Feature Gate & RBAC**
    - [x] Build a `PremiumGuard` middleware to lock dashboards features based on `tier`.
    - [x] Configure PocketBase API Rules to restrict `/admin` strictly to Admin UUIDs.


## Phase 7.5: Tiered Logic & Multi-Dashboard Refinement
*Goal: Implementing a 3-tier subscription system with per-user data isolation and conversion-optimized pricing.*

- [ ] **Task 7.5.1: Tier System Foundation**
    - [ ] Update PocketBase schema: Add `tier` field (number: 0=Free, 1=Hero, 2=Legend).
    - [ ] Remove `is_premium` boolean, migrate logic to use `tier >= 1`.
    - [ ] Update `useAuth` hook and TypeScript types to support `tier`.
    - [ ] Create `TierGate` component for conditional feature rendering.
- [ ] **Task 7.5.2: Per-User Data Isolation (Bug Fix)**
    - [ ] Fix localStorage sharing bug: Store `partner_name`, `recipient_role` in PocketBase per user.
    - [ ] Update Dashboard to load/save user-specific data from database.
    - [ ] Ensure data isolation between different user sessions.
- [ ] **Task 7.5.3: Dashboard Tier-Based Features**
    - [ ] Free (Tier 0): Show blurred/locked automation with "Upgrade" CTA, last 3 days history only.
    - [ ] Hero (Tier 1): Full automation settings, full streak history.
    - [ ] Legend (Tier 2): All Hero features + exclusive streak card styles.
- [ ] **Task 7.5.4: Pricing & Conversion Page (`/pricing`)**
    - [ ] Create dedicated pricing page showing all 3 tiers side-by-side.
    - [ ] Apply conversion psychology: Highlight value, social proof, urgency.
    - [ ] Design compelling feature comparison matrix.
    - [ ] Integrate with Lemon Squeezy checkout for Hero & Legend tiers.
- [ ] **Task 7.5.5: Streak Card Styles & Social Sharing**
    - [ ] Create multiple streak card design templates.
    - [ ] Hero: Access to basic styles. Legend: Access to all styles (basic locked for Hero).
    - [ ] Add social sharing buttons: WhatsApp, Instagram, Facebook.
    - [ ] Include marketing tagline/URL in shared content for viral growth.
- [ ] **Task 7.5.6: Admin + User Dashboard Access**
    - [ ] Allow admin users to access both `/admin` AND `/dashboard`.
    - [ ] Update dropdown menu to show both options for admins.
- [ ] **Task 7.5.7: Algorithm Update for Tiers**
    - [ ] Free/Hero: Use `Hash(Date)` for shared daily spark.
    - [ ] Legend: Use `Hash(UserUUID + Date)` for truly unique 1-of-1 spark.


## Phase 8: Legend Tier Enhancements (Premium Experience)
*Goal: Making Legend tier irresistibly valuable with exclusive features that deepen emotional connection.*

- [ ] **Task 8.1: Love Language Mode**
    - [ ] Add `love_language` field to user schema (Words of Affirmation, Acts of Service, Quality Time, Physical Touch, Receiving Gifts).
    - [ ] Create love language quiz/selector in onboarding or dashboard.
    - [ ] Build message templates tailored to each love language.
    - [ ] Modify `getPremiumSpark` to incorporate love language into message selection.
- [ ] **Task 8.2: Anniversary Intelligence**
    - [ ] Add `anniversary_date`, `partner_birthday` fields to user schema.
    - [ ] Create date input UI in dashboard relationship profile.
    - [ ] Build special anniversary/birthday message pool (50+ messages each).
    - [ ] Implement automatic detection and delivery of special messages on dates.
    - [ ] Add countdown widget: "23 days until your anniversary!"
- [ ] **Task 8.3: Partner Link (Two-Way Mode)**
    - [ ] Design partner invitation system with unique link generation.
    - [ ] Create `partner_links` collection in PocketBase.
    - [ ] Build partner acceptance flow and account linking.
    - [ ] Implement "Love Ping" - instant mutual notification feature.
    - [ ] Create shared streak counter visible to both partners.
- [ ] **Task 8.4: Premium Poet Pool (Exclusive Content)**
    - [ ] Curate 200+ Legend-exclusive poetic messages.
    - [ ] Implement tiered message pools (Free < Hero < Legend).
    - [ ] Create content rotation system to prevent repetition.
    - [ ] Add "Message Rarity" indicator (Common, Rare, Epic, Legendary).
- [ ] **Task 8.5: Unlimited Spark Archive**
    - [ ] Build full history view for Legend users (no date limit).
    - [ ] Add search/filter functionality for past sparks.
    - [ ] Implement "Favorites" system to bookmark special messages.
    - [ ] Create export feature (PDF/printable format).
- [ ] **Task 8.6: Photo Memory Cards**
    - [ ] Add photo upload to user profile/dashboard.
    - [ ] Integrate uploaded photos into shareable streak cards.
    - [ ] Build multiple photo card templates with different layouts.
    - [ ] Implement photo storage in PocketBase files collection.
- [ ] **Task 8.7: Emotional Tone Selection**
    - [ ] Add tone preference setting (Playful, Romantic, Passionate, Sweet, Poetic).
    - [ ] Tag messages in pool with tone categories.
    - [ ] Update algorithm to weight messages by selected tone.
    - [ ] Create tone preview in settings UI.
- [ ] **Task 8.8: Auto-Reply Suggestions**
    - [ ] Build "Suggested Response" feature for received sparks.
    - [ ] Create response message pool (100+ quick replies).
    - [ ] Implement one-tap copy for suggested responses.
    - [ ] Add personalization with partner name in responses.
- [ ] **Task 8.9: Premium Streak Card Templates**
    - [ ] Design 10+ exclusive streak card templates for Legend.
    - [ ] Add animated card options (subtle effects).
    - [ ] Create seasonal/holiday themed templates.
    - [ ] Implement template preview and selection UI.
- [ ] **Task 8.10: Advanced Integrations (Power Users)**
    - [ ] Build API key generation for Legend users.
    - [ ] Create webhook support for external integrations.
    - [ ] Document API endpoints for developers.
    - [ ] Add Zapier/Make integration templates.

## Phase 9: Reliability & Scaling (Production-Grade)
*Goal: Hardening the system against abuse and ensuring revenue recovery.*

- [ ] **Task 9.1: Anti-Spam & Security**
    - [ ] Implement `lru-cache` rate-limiting on OTP requests (3 requests / 15 mins).
    - [ ] Set up Webhook signature verification for Lemon Squeezy to prevent spoofing.
- [ ] **Task 9.2: Data Recovery & Sync**
    - [ ] Create `src/scripts/sync-subs.ts`: A manual recovery script to sync LS subscriptions to PB.
    - [ ] Implement Webhook Idempotency: Verify `is_premium` status before redundant DB writes.
- [ ] **Task 9.3: Automated Quality Assurance**
    - [ ] **Unit Tests:** Vitest for `algo.ts` (determinism) and `rateLimit.ts`.
    - [ ] **E2E Tests:** Playwright for the "Copy Spark" -> "Toast" -> "Counter Increment" flow.
    - [ ] **API Tests:** Mock webhook payloads to verify premium unlocking logic.

## Phase 10: Deployment & Handover
*Goal: Orchestrating the "Sovereign" VPS environment.*

- [ ] **Task 10.1: Process Management**
    - [ ] Configure `PM2` for dual-process management: `luvora-web` and `luvora-broadcast`.
- [ ] **Task 10.2: CI/CD "Sovereign Script"**
    - [ ] Build `deploy.sh`: One-click SSH, `git pull`, `bun build`, and PM2 restart.
- [ ] **Task 10.3: Messaging Compliance**
    - [ ] Register WhatsApp "Morning Spark" Templates in the Meta Developer Portal.



