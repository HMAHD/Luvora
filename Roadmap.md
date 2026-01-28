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

- [ ] **Task 7.1: The User Command Center (`/dashboard`)**
    - [ ] **Automation Hub:** UI to manage `morning_time`, `timezone`, and `messaging_id`.
    - [ ] **Relationship Profile:** Section to update `partner_name` and `recipient_role`.
    - [ ] **Streak History:** A grid view of previous sparks with a one-click "Re-send" button.
- [ ] **Task 7.2: The Admin Cockpit (`/admin`)**
    - [ ] **Financial Dashboard:** Real-time MRR and subscriber count via Lemon Squeezy API.
    - [ ] **Content Management:** Custom CRUD interface for the PocketBase `messages` collection.
    - [ ] **Broadcast Monitor:** Status table showing successful/failed automated sends.
- [ ] **Task 7.3: Feature Gate & RBAC**
    - [ ] Build a `PremiumGuard` middleware to lock dashboards features based on `tier`.
    - [ ] Configure PocketBase API Rules to restrict `/admin` strictly to Admin UUIDs.


## Phase 8: Reliability & Scaling (Production-Grade)
*Goal: Hardening the system against abuse and ensuring revenue recovery.*

- [ ] **Task 8.1: Anti-Spam & Security**
    - [ ] Implement `lru-cache` rate-limiting on OTP requests (3 requests / 15 mins).
    - [ ] Set up Webhook signature verification for Lemon Squeezy to prevent spoofing.
- [ ] **Task 8.2: Data Recovery & Sync**
    - [ ] Create `src/scripts/sync-subs.ts`: A manual recovery script to sync LS subscriptions to PB.
    - [ ] Implement Webhook Idempotency: Verify `is_premium` status before redundant DB writes.
- [ ] **Task 8.3: Automated Quality Assurance**
    - [ ] **Unit Tests:** Vitest for `algo.ts` (determinism) and `rateLimit.ts`.
    - [ ] **E2E Tests:** Playwright for the "Copy Spark" -> "Toast" -> "Counter Increment" flow.
    - [ ] **API Tests:** Mock webhook payloads to verify premium unlocking logic.

## Phase 9: Deployment & Handover
*Goal: Orchestrating the "Sovereign" VPS environment.*

- [ ] **Task 9.1: Process Management**
    - [ ] Configure `PM2` for dual-process management: `luvora-web` and `luvora-broadcast`.
- [ ] **Task 9.2: CI/CD "Sovereign Script"**
    - [ ] Build `deploy.sh`: One-click SSH, `git pull`, `bun build`, and PM2 restart.
- [ ] **Task 9.3: Messaging Compliance**
    - [ ] Register WhatsApp "Morning Spark" Templates in the Meta Developer Portal.



