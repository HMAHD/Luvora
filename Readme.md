# ⚡️ Luvora
> **The Deterministic Daily Spark.**  
> *Meaningful connection, one day at a time.*

![Gradient Line](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.png)

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1.1-black?style=for-the-badge&logo=bun&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PocketBase](https://img.shields.io/badge/PocketBase-v0.22-orange?style=for-the-badge&logo=pocketbase&logoColor=white)

</div>

## 📖 About

**Luvora** is a sovereign relationship companion app designed to deliver one deterministic, meaningful "Daily Spark" message to couples every day.

Built with the **"Mirat" Spirit** (Meaningful, Intentional, Ritualistic, Authentic, Timeless), it avoids infinite scrolling and dopamine loops in favor of a single, high-quality moment of connection.

### ✨ Key Features
- **🧁/🖤 Auto-Theme Switching**: Adapts to Dawn (Cupcake) and Night (Luxury) modes automatically based on local time.
- **🔐 Deterministic Algorithm**: Generates the same message for everyone on the same day, fostering a shared global experience.
- **⚡️ Sovereignty**: Self-hosted backend using PocketBase for privacy and ownership.

![Gradient Line](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.png)

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Runtime**: [Bun](https://bun.sh/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [daisyUI](https://daisyui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Backend**: [PocketBase](https://pocketbase.io/)

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed locally.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/luvora.git
   cd luvora
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Run the development server**
   ```bash
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🚀 Deployment (Phase 5)

### 1. Messaging Automation
To run the automated broadcast loop on your VPS, use PM2:
```bash
pm2 start "bun src/scripts/broadcast.ts" --name luvora-broadcast
```

### 2. Environment Variables
Ensure your `.env.local` (or production env) has:
- `TELEGRAM_BOT_TOKEN`
- `WHATSAPP_API_TOKEN`
- `POCKETBASE_ADMIN_EMAIL`
- `POCKETBASE_ADMIN_PASSWORD`

### 3. PocketBase Setup
1. **Download & Run**: Install PocketBase v0.24+ and run `./pocketbase serve`.
2. **Import Schema**: Go to Settings > Import Collections and paste the contents of `pb_schema.json`.
3. **Configure Environment**:
   Duplicate `.env.example` to `.env.local` and add:
   ```bash
   NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
   POCKETBASE_ADMIN_EMAIL=your-admin-email
   POCKETBASE_ADMIN_PASSWORD=your-admin-password
   ```

## 🗺 Roadmap Status

| Phase | Goal | Status |
| :--- | :--- | :--- |
| **Phase 0** | **Project Genesis** (Infrastructure) | ✅ **Complete** |
| **Phase 1** | **Core Logic** (The Engine) | ✅ **Complete** |
| **Phase 2** | **Frontend "Pro-Max"** (The Interface) |  **Complete** |
| **Phase 3** | **Sovereign Backend** (PocketBase) | ✅ **Complete** |
| **Phase 4** | **Premium & Payments** | 🚧 *In Progress* |

---

<div align="center">
  <sub>Built with ❤️ by the HMAHD.</sub>
</div>
