#!/bin/bash

# Luvora VPS Setup Script
# Run this on your VPS to set up the environment

echo "🚀 Luvora VPS Setup"
echo "==================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo "⚠️  Please run as regular user, not root"
  echo "   Use: su - your-username"
  exit 1
fi

echo "This script will:"
echo "1. Install Bun"
echo "2. Install PM2"
echo "3. Create directory structure"
echo "4. Guide you through .env.local creation"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 0
fi

# 1. Install Bun
echo ""
echo "1️⃣  Installing Bun..."
if command -v bun &> /dev/null; then
  echo "✅ Bun already installed: $(bun --version)"
else
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
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

# 3. Setup directory structure
echo ""
echo "3️⃣  Setting up directory structure..."

# Production
if [ ! -d "/home/luvora-production/Luvora" ]; then
  echo "Creating production directory..."
  mkdir -p /home/luvora-production
  cd /home/luvora-production
  git clone https://github.com/HMAHD/Luvora.git
  cd Luvora
  git checkout main
  mkdir -p logs
  echo "✅ Production directory created"
else
  echo "✅ Production directory exists"
fi

# Staging
if [ ! -d "/home/luvora-staging/Luvora" ]; then
  echo "Creating staging directory..."
  mkdir -p /home/luvora-staging
  cd /home/luvora-staging
  git clone https://github.com/HMAHD/Luvora.git
  cd Luvora
  git checkout develop
  mkdir -p logs
  echo "✅ Staging directory created"
else
  echo "✅ Staging directory exists"
fi

# 4. Create .env.local templates
echo ""
echo "4️⃣  Creating .env.local files..."

create_env_file() {
  local ENV_PATH=$1
  local ENV_NAME=$2
  local APP_URL=$3

  if [ -f "$ENV_PATH" ]; then
    echo "⚠️  $ENV_PATH already exists, skipping"
  else
    cat > "$ENV_PATH" << 'EOF'
# ===========================================
# Application URLs
# ===========================================
NEXT_PUBLIC_APP_URL=__APP_URL__
NEXT_PUBLIC_POCKETBASE_URL=__POCKETBASE_URL__

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
NEXT_PUBLIC_SENTRY_ENVIRONMENT=__ENV_NAME__
SENTRY_AUTH_TOKEN=
SENTRY_ORG=akash-hasendra
SENTRY_PROJECT=luvora
EOF

    # Replace placeholders
    if [ "$ENV_NAME" = "production" ]; then
      sed -i "s|__APP_URL__|https://luvora.love|g" "$ENV_PATH"
      sed -i "s|__POCKETBASE_URL__|https://api.luvora.love|g" "$ENV_PATH"
    else
      sed -i "s|__APP_URL__|https://staging.luvora.love|g" "$ENV_PATH"
      sed -i "s|__POCKETBASE_URL__|https://staging-api.luvora.love|g" "$ENV_PATH"
    fi
    sed -i "s|__ENV_NAME__|$ENV_NAME|g" "$ENV_PATH"

    echo "✅ Created $ENV_PATH"
    echo "   ⚠️  IMPORTANT: Edit this file and add your secrets!"
  fi
}

create_env_file "/home/luvora-production/Luvora/.env.local" "production" "https://luvora.love"
create_env_file "/home/luvora-staging/Luvora/.env.local" "staging" "https://staging.luvora.love"

# 5. Setup PM2 startup
echo ""
echo "5️⃣  Setting up PM2 startup..."
pm2 startup | grep "sudo" | bash
echo "✅ PM2 startup configured"

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo ""
echo "1. Edit environment files with your secrets:"
echo "   nano /home/luvora-production/Luvora/.env.local"
echo "   nano /home/luvora-staging/Luvora/.env.local"
echo ""
echo "2. Install dependencies and build:"
echo "   cd /home/luvora-production/Luvora && bun install && bun run build"
echo "   cd /home/luvora-staging/Luvora && bun install && bun run build"
echo ""
echo "3. Start PM2 processes:"
echo "   cd /home/luvora-production/Luvora && pm2 start ecosystem.config.js --only luvora-production-3002"
echo "   cd /home/luvora-staging/Luvora && pm2 start ecosystem.config.js --only luvora-staging-3003"
echo "   pm2 save"
echo ""
echo "4. Set up Nginx and SSL certificates (see docs/DEPLOYMENT.md)"
echo ""
echo "5. Test health checks:"
echo "   curl http://localhost:3002/api/health"
echo "   curl http://localhost:3003/api/health"
echo ""
