#!/bin/bash

# Luvora Production Setup Script
# Run this on your VPS to set up production environment

echo "🚀 Luvora Production Setup"
echo "==========================="
echo ""

# Setup Bun environment
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

APP_DIR="/home/luvora-production"
REPO_DIR="$APP_DIR/Luvora"

# 1. Install Bun
echo "1️⃣  Installing Bun..."
if command -v bun &> /dev/null; then
  echo "✅ Bun already installed: $(bun --version)"
else
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  source ~/.bashrc
  echo "✅ Bun installed"
fi

# 2. Install PM2
echo ""
echo "2️⃣  Installing PM2..."
if command -v pm2 &> /dev/null; then
  echo "✅ PM2 already installed"
else
  bun add -g pm2
  echo "✅ PM2 installed"
fi

# 3. Create directory and clone repo
echo ""
echo "3️⃣  Setting up repository..."
if [ ! -d "$REPO_DIR" ]; then
  mkdir -p "$APP_DIR"
  cd "$APP_DIR"
  git clone https://github.com/HMAHD/Luvora.git
  cd "$REPO_DIR"
  git checkout main
  mkdir -p logs
  echo "✅ Repository cloned"
else
  echo "✅ Repository already exists"
  cd "$REPO_DIR"
  git fetch origin
  git checkout main
  git pull origin main
fi

# 4. Create .env.local template
echo ""
echo "4️⃣  Creating .env.local template..."
if [ -f "$REPO_DIR/.env.local" ]; then
  echo "⚠️  .env.local already exists, skipping"
else
  cat > "$REPO_DIR/.env.local" << 'EOF'
# ===========================================
# Application URLs
# ===========================================
NEXT_PUBLIC_APP_URL=https://luvora.love
NEXT_PUBLIC_POCKETBASE_URL=https://api.luvora.love

# ===========================================
# Database (PocketBase Admin)
# ===========================================
POCKETBASE_ADMIN_EMAIL=admin@luvora.love
POCKETBASE_ADMIN_PASSWORD=

# ===========================================
# Payments (LemonSqueezy)
# ===========================================
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_HERO_VARIANT_ID=
LEMONSQUEEZY_LEGEND_VARIANT_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=

# ===========================================
# Premium Pool Secret
# ===========================================
PREMIUM_POOL_SECRET=

# ===========================================
# Admin Access
# ===========================================
NEXT_PUBLIC_ADMIN_UUIDS=
NEXT_PUBLIC_ADMIN_EMAILS=admin@luvora.love

# ===========================================
# Messaging Integrations
# ===========================================
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=

# ===========================================
# WhatsApp (Whapi.cloud)
# ===========================================
WHAPI_API_TOKEN=
WHAPI_API_URL=https://gate.whapi.cloud/

# ===========================================
# Email (SMTP)
# ===========================================
SMTP_HOST=smtp-pulse.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@luvora.love
SMTP_FROM_NAME=Luvora

# ===========================================
# Cron Jobs
# ===========================================
CRON_SECRET=

# ===========================================
# Sentry Error Tracking
# ===========================================
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
SENTRY_AUTH_TOKEN=
SENTRY_ORG=akash-hasendra
SENTRY_PROJECT=luvora
EOF

  echo "✅ Created .env.local template"
  echo "⚠️  IMPORTANT: Edit $REPO_DIR/.env.local and add your secrets!"
fi

# 5. Install dependencies
echo ""
echo "5️⃣  Installing dependencies..."
cd "$REPO_DIR"
bun install --frozen-lockfile
echo "✅ Dependencies installed"

# 6. Build application
echo ""
echo "6️⃣  Building application..."
bun run build
echo "✅ Build complete"

# 7. Setup PM2
echo ""
echo "7️⃣  Setting up PM2..."
if pm2 describe luvora-production-3002 > /dev/null 2>&1; then
  echo "PM2 process exists, reloading..."
  pm2 reload luvora-production-3002
else
  echo "Starting PM2 process..."
  pm2 start ecosystem.config.js --only luvora-production-3002
fi
pm2 save

# Setup PM2 startup
echo "Run the following command manually to configure PM2 startup:"
pm2 startup
echo "(Copy and run the sudo command printed above)"

echo "✅ PM2 configured"

# 8. Test health
echo ""
echo "8️⃣  Testing application..."
sleep 5
if curl -f http://localhost:3002/api/health > /dev/null 2>&1; then
  echo "✅ Application is running!"
  curl -s http://localhost:3002/api/health | head -5
else
  echo "⚠️  Application might not be running correctly"
  echo "   Check logs: pm2 logs luvora-production-3002"
fi

echo ""
echo "========================================="
echo "✅ Production Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your secrets:"
echo "   nano $REPO_DIR/.env.local"
echo ""
echo "2. Restart PM2 after editing .env:"
echo "   pm2 restart luvora-production-3002"
echo ""
echo "3. Set up Nginx reverse proxy (see docs/DEPLOYMENT.md)"
echo "4. Get SSL certificate: sudo certbot --nginx -d luvora.love"
echo ""
echo "5. View logs:"
echo "   pm2 logs luvora-production-3002"
echo ""
