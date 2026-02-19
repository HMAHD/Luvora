#!/bin/bash

# Telegram Webhook Setup Script
# This script configures your Telegram bot to use webhook mode instead of polling

set -eu

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}Error: .env.local file not found${NC}"
    exit 1
fi

# Load environment variables safely (avoid shell injection from .env.local values)
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
    # Remove leading/trailing whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    export "$key=$value"
done < .env.local

# Check required variables
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo -e "${RED}Error: TELEGRAM_BOT_TOKEN not set in .env.local${NC}"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
    echo -e "${RED}Error: NEXT_PUBLIC_APP_URL not set in .env.local${NC}"
    exit 1
fi

# Generate a random secret token if not set
if [ -z "$TELEGRAM_WEBHOOK_SECRET" ]; then
    TELEGRAM_WEBHOOK_SECRET=$(openssl rand -hex 32)
    echo -e "${YELLOW}Generated new webhook secret token${NC}"
    echo "Add this to your .env.local:"
    echo "TELEGRAM_WEBHOOK_SECRET=$TELEGRAM_WEBHOOK_SECRET"
    echo ""
fi

WEBHOOK_URL="${NEXT_PUBLIC_APP_URL}/api/webhooks/telegram"

echo -e "${YELLOW}Setting up Telegram webhook...${NC}"
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# Set webhook
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{
        \"url\": \"${WEBHOOK_URL}\",
        \"secret_token\": \"${TELEGRAM_WEBHOOK_SECRET}\",
        \"max_connections\": 40,
        \"drop_pending_updates\": true
    }")

# Check if successful
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo -e "${GREEN}✓ Webhook set successfully!${NC}"
    echo ""

    # Get webhook info
    echo -e "${YELLOW}Webhook information:${NC}"
    if command -v jq &>/dev/null; then
        curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo" | jq '.'
    else
        curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
    fi
else
    echo -e "${RED}✗ Failed to set webhook${NC}"
    if command -v jq &>/dev/null; then
        echo "$RESPONSE" | jq '.'
    else
        echo "$RESPONSE"
    fi
    exit 1
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "To remove the webhook and go back to polling mode, run:"
echo "curl -X POST \"https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook\""
