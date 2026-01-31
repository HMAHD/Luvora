#!/bin/bash

# Luvora Deployment Diagnostic Script
# Run this on your VPS to diagnose deployment issues

echo "🔍 Luvora Deployment Diagnostics"
echo "=================================="
echo ""

ENV=$1
if [ -z "$ENV" ]; then
  echo "Usage: ./diagnose-deployment.sh [production|staging]"
  echo "Example: ./diagnose-deployment.sh production"
  exit 1
fi

if [ "$ENV" = "production" ]; then
  APP_DIR="/home/luvora-production/Luvora"
  PORT=3002
  PM2_NAME="luvora-production-3002"
  DOMAIN="luvora.love"
elif [ "$ENV" = "staging" ]; then
  APP_DIR="/home/luvora-staging/Luvora"
  PORT=3003
  PM2_NAME="luvora-staging-3003"
  DOMAIN="staging.luvora.love"
else
  echo "❌ Invalid environment. Use 'production' or 'staging'"
  exit 1
fi

echo "Environment: $ENV"
echo "App Directory: $APP_DIR"
echo "Port: $PORT"
echo ""

# 1. Check if directory exists
echo "1️⃣  Checking directory structure..."
if [ -d "$APP_DIR" ]; then
  echo "✅ Directory exists: $APP_DIR"
else
  echo "❌ Directory NOT found: $APP_DIR"
  echo "   Run: mkdir -p $APP_DIR && cd $(dirname $APP_DIR) && git clone https://github.com/HMAHD/Luvora.git"
fi
echo ""

# 2. Check if .env.local exists
echo "2️⃣  Checking .env.local..."
if [ -f "$APP_DIR/.env.local" ]; then
  echo "✅ .env.local exists"
  echo "   Contains $(wc -l < $APP_DIR/.env.local) lines"
else
  echo "❌ .env.local NOT found!"
  echo "   Create it at: $APP_DIR/.env.local"
fi
echo ""

# 3. Check Bun installation
echo "3️⃣  Checking Bun installation..."
if command -v bun &> /dev/null; then
  echo "✅ Bun is installed: $(bun --version)"
else
  echo "❌ Bun NOT found in PATH"
  echo "   Install: curl -fsSL https://bun.sh/install | bash"
fi
echo ""

# 4. Check if dependencies are installed
echo "4️⃣  Checking dependencies..."
if [ -d "$APP_DIR/node_modules" ]; then
  echo "✅ node_modules exists"
else
  echo "❌ node_modules NOT found"
  echo "   Run: cd $APP_DIR && bun install"
fi
echo ""

# 5. Check if build exists
echo "5️⃣  Checking build output..."
if [ -d "$APP_DIR/.next" ]; then
  echo "✅ .next build directory exists"
else
  echo "❌ .next NOT found - app not built"
  echo "   Run: cd $APP_DIR && bun run build"
fi
echo ""

# 6. Check PM2
echo "6️⃣  Checking PM2..."
if command -v pm2 &> /dev/null; then
  echo "✅ PM2 is installed"
  if pm2 describe $PM2_NAME > /dev/null 2>&1; then
    echo "✅ PM2 process '$PM2_NAME' exists"
    pm2 describe $PM2_NAME | grep -E "status|restart|uptime"
  else
    echo "⚠️  PM2 process '$PM2_NAME' NOT running"
    echo "   Start: cd $APP_DIR && pm2 start ecosystem.config.js --only $PM2_NAME"
  fi
else
  echo "❌ PM2 NOT found"
  echo "   Install: bun add -g pm2"
fi
echo ""

# 7. Check if port is listening
echo "7️⃣  Checking if app is listening on port $PORT..."
if lsof -i :$PORT > /dev/null 2>&1; then
  echo "✅ Port $PORT is listening"
  lsof -i :$PORT
else
  echo "❌ Nothing listening on port $PORT"
fi
echo ""

# 8. Check Nginx
echo "8️⃣  Checking Nginx configuration..."
if command -v nginx &> /dev/null; then
  echo "✅ Nginx is installed"
  if [ -f "/etc/nginx/sites-enabled/luvora-$ENV" ]; then
    echo "✅ Nginx config exists for $ENV"
  else
    echo "❌ Nginx config NOT found at /etc/nginx/sites-enabled/luvora-$ENV"
  fi

  # Test nginx config
  if sudo nginx -t > /dev/null 2>&1; then
    echo "✅ Nginx configuration is valid"
  else
    echo "❌ Nginx configuration has errors"
    sudo nginx -t
  fi
else
  echo "❌ Nginx NOT found"
fi
echo ""

# 9. Test health endpoint locally
echo "9️⃣  Testing health endpoint locally..."
if curl -f http://localhost:$PORT/api/health > /dev/null 2>&1; then
  echo "✅ Local health check passed"
  curl -s http://localhost:$PORT/api/health | head -5
else
  echo "❌ Local health check failed"
  echo "   Try: curl http://localhost:$PORT/api/health"
fi
echo ""

# 10. Test health endpoint via domain
echo "🔟 Testing health endpoint via domain..."
if curl -f https://$DOMAIN/api/health > /dev/null 2>&1; then
  echo "✅ Domain health check passed"
  curl -s https://$DOMAIN/api/health | head -5
else
  echo "❌ Domain health check failed"
  echo "   Try: curl -v https://$DOMAIN/api/health"
fi
echo ""

# 11. Check logs
echo "1️⃣1️⃣  Recent PM2 logs (last 20 lines)..."
if pm2 describe $PM2_NAME > /dev/null 2>&1; then
  echo "--- Error Log ---"
  pm2 logs $PM2_NAME --err --lines 20 --nostream
  echo ""
  echo "--- Out Log ---"
  pm2 logs $PM2_NAME --out --lines 20 --nostream
else
  echo "⚠️  PM2 process not running, no logs available"
fi
echo ""

echo "=================================="
echo "✅ Diagnostics complete!"
echo ""
echo "Next steps:"
echo "1. Fix any ❌ issues above"
echo "2. Restart PM2: pm2 restart $PM2_NAME"
echo "3. Check logs: pm2 logs $PM2_NAME"
echo "4. Test health: curl http://localhost:$PORT/api/health"
