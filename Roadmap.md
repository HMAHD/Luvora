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

## Phase 1: Core Logic & "Mirat" Spirit (The Engine)
*Goal: Building the deterministic message generation system.*

- [ ] **Task 1.1: The Deterministic Algorithm**
    - [ ] Create `lib/algo.ts` with a SHA-256 date-based hashing function.
    - [ ] Logic: `const dailyIdx = Hash(Today) % PoolSize`.
- [ ] **Task 1.2: Local Persistence Layer**
    - [ ] Build `useLocalStorage` hook to store `partner_name` and `user_settings`.
    - [ ] Implementation: Zero-database calls for free users to maintain VPS performance.
- [ ] **Task 1.3: Content Seeding**
    - [ ] Structure `messages.json` with 300+ initial entries.
    - [ ] Create `nicknames.json` with 100+ "Ethereal" names (Nova, Suki, etc.).

## Phase 2: Frontend "Pro-Max" (The Interface)
*Goal: High-fidelity, mobile-first UI using daisyUI semantic components.*

- [ ] **Task 2.1: The Main "Spark Card"**
    - [ ] Design a `glassmorphism` card with daisyUI `card` and `shadow-2xl`.
    - [ ] Implement animated text transitions using `framer-motion` for "The Daily Spark."
- [ ] **Task 2.2: Interaction Design**
    - [ ] "One-Tap Copy" button: Large, thumb-friendly, with daisyUI `btn-primary`.
    - [ ] Browser Clipboard API integration + `navigator.vibrate([50])` for haptics.
- [ ] **Task 2.3: Emotional Feedback**
    - [ ] Build a daisyUI `toast` system: "Spark sent to Nova! 🚀"
    - [ ] Implement "Specialness Counter": Animated ticker showing global usage stats.

## Phase 3: Sovereign Backend (PocketBase)
*Goal: Moving to a self-hosted database for authentication and premium data.*

- [ ] **Task 3.1: Collection Architecture**
    - [ ] Create `users` (id, email, partner_name, is_premium).
    - [ ] Create `message_stats` (daily_clicks, total_shares).
- [ ] **Task 3.2: Magic Link Authentication**
    - [ ] Integrate PocketBase Auth Flow: Passwordless login for seamless UX.
- [ ] **Task 3.3: Premium Logic Gate**
    - [ ] Build the `PremiumGuard` middleware to unlock unique 1-of-1 messages.

## Phase 4: Monetization & Exclusivity
*Goal: Converting visitors into paying "Heroes."*

- [ ] **Task 4.1: The "Unique Seed" Algorithm**
    - [ ] Logic: `PremiumIdx = Hash(UserUUID + Today) % PremiumPoolSize`.
- [ ] **Task 4.2: Payment Gateway (Stripe/Lemon Squeezy)**
    - [ ] Implement Webhook listener to update `is_premium` status in PocketBase.
- [ ] **Task 4.3: The Upgrade Modal**
    - [ ] Design a high-conversion daisyUI modal: "Don't be 1 of 14,000. Be 1 of 1."

## Phase 5: Automation (The "Lazy Hero" Tier)
*Goal: Scaling to high-ticket subscriptions with automated delivery.*

- [ ] **Task 5.1: WhatsApp/Telegram Integration**
    - [ ] Connect Meta Cloud API for WhatsApp messaging.
- [ ] **Task 5.2: VPS Cron Engine**
    - [ ] Setup Node-Cron job on VPS to pull unique messages and send at 07:00 AM local.
- [ ] **Task 5.3: Viral Loop "Love Streak"**
    - [ ] Build image generator (Canvas/HTML) for social media sharing.