#!/bin/bash

################################################################################
# Luvora Cron Setup Script
# Automatically configures systemd timer or crontab for spark delivery
#
# Usage: ./scripts/setup-cron.sh
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Function to print colored messages
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running with sudo for systemd installation
check_sudo() {
    if [ "$EUID" -ne 0 ] && [ "$1" = "systemd" ]; then
        log_error "Please run with sudo for systemd installation: sudo ./scripts/setup-cron.sh"
        exit 1
    fi
}

# Detect the current user (even when running with sudo)
ACTUAL_USER="${SUDO_USER:-$USER}"
ACTUAL_HOME=$(eval echo ~$ACTUAL_USER)

# Load environment variables
if [ -f "$PROJECT_DIR/.env.local" ]; then
    log_info "Loading environment variables from .env.local"
    export $(cat "$PROJECT_DIR/.env.local" | grep -E "^(CRON_SECRET|NEXT_PUBLIC_POCKETBASE_URL)" | xargs)
else
    log_warning ".env.local not found, using defaults"
fi

# Configuration
APP_URL="${NEXT_PUBLIC_POCKETBASE_URL:-http://localhost:3000}"
APP_URL=$(echo "$APP_URL" | sed 's|:8090|:3000|')  # Replace PocketBase port with Next.js port
CRON_SECRET="${CRON_SECRET:-Luvora}"
LOG_DIR="/var/log/luvora"

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   Luvora Spark Delivery - Cron Setup      ║"
echo "╚════════════════════════════════════════════╝"
echo ""

log_info "Project directory: $PROJECT_DIR"
log_info "App URL: $APP_URL"
log_info "Cron secret: ${CRON_SECRET:0:4}***"
log_info "User: $ACTUAL_USER"
echo ""

# Test if app is reachable
log_info "Testing if app is reachable..."
if curl -s --max-time 5 "$APP_URL" > /dev/null 2>&1; then
    log_success "App is reachable at $APP_URL"
else
    log_warning "App is not reachable at $APP_URL (this is OK if setting up before deployment)"
fi

# Test if cron endpoint works
log_info "Testing cron endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $CRON_SECRET" "$APP_URL/api/cron/deliver" 2>/dev/null || echo -e "\n000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    log_success "Cron endpoint is working (HTTP 200)"
elif [ "$HTTP_CODE" = "401" ]; then
    log_error "Cron endpoint authentication failed (HTTP 401) - Check CRON_SECRET"
    exit 1
elif [ "$HTTP_CODE" = "000" ]; then
    log_warning "Could not reach cron endpoint (app may not be running)"
else
    log_warning "Unexpected response: HTTP $HTTP_CODE"
fi

echo ""
echo "Choose setup method:"
echo "  1) Systemd Timer (Recommended for production VPS)"
echo "  2) Crontab (Traditional cron)"
echo "  3) Manual setup (show instructions only)"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        log_info "Setting up Systemd Timer..."
        check_sudo "systemd"

        # Create log directory
        mkdir -p "$LOG_DIR"
        chown "$ACTUAL_USER:$ACTUAL_USER" "$LOG_DIR"
        log_success "Created log directory: $LOG_DIR"

        # Make cron script executable
        chmod +x "$SCRIPT_DIR/cron-deliver.sh"
        log_success "Made cron script executable"

        # Update service file with current configuration
        SERVICE_FILE="/tmp/luvora-cron.service"
        sed -e "s|User=your-user|User=$ACTUAL_USER|g" \
            -e "s|WorkingDirectory=/path/to/Luvora|WorkingDirectory=$PROJECT_DIR|g" \
            -e "s|Environment=\"APP_URL=http://localhost:3000\"|Environment=\"APP_URL=$APP_URL\"|g" \
            -e "s|Environment=\"CRON_SECRET=Luvora\"|Environment=\"CRON_SECRET=$CRON_SECRET\"|g" \
            -e "s|ExecStart=/path/to/Luvora/scripts/cron-deliver.sh|ExecStart=$SCRIPT_DIR/cron-deliver.sh|g" \
            "$SCRIPT_DIR/luvora-cron.service" > "$SERVICE_FILE"

        # Copy files to systemd directory
        cp "$SERVICE_FILE" /etc/systemd/system/luvora-cron.service
        cp "$SCRIPT_DIR/luvora-cron.timer" /etc/systemd/system/luvora-cron.timer
        log_success "Copied systemd units to /etc/systemd/system/"

        # Reload systemd daemon
        systemctl daemon-reload
        log_success "Reloaded systemd daemon"

        # Enable and start the timer
        systemctl enable luvora-cron.timer
        systemctl start luvora-cron.timer
        log_success "Enabled and started luvora-cron.timer"

        echo ""
        log_success "Systemd timer setup complete!"
        echo ""
        echo "Management commands:"
        echo "  sudo systemctl status luvora-cron.timer    # Check timer status"
        echo "  sudo systemctl status luvora-cron.service  # Check last run"
        echo "  sudo journalctl -u luvora-cron.service -f  # View logs"
        echo "  sudo systemctl restart luvora-cron.timer   # Restart timer"
        echo ""
        echo "Next execution: $(systemctl list-timers luvora-cron.timer --no-pager | grep luvora | awk '{print $1, $2}')"
        ;;

    2)
        log_info "Setting up Crontab..."

        # Create log directory
        sudo mkdir -p "$LOG_DIR"
        sudo chown "$ACTUAL_USER:$ACTUAL_USER" "$LOG_DIR"
        log_success "Created log directory: $LOG_DIR"

        # Make cron script executable
        chmod +x "$SCRIPT_DIR/cron-deliver.sh"
        log_success "Made cron script executable"

        # Generate crontab entry
        CRON_ENTRY="* * * * * APP_URL=$APP_URL CRON_SECRET=$CRON_SECRET $SCRIPT_DIR/cron-deliver.sh >> $LOG_DIR/cron.log 2>&1"

        echo ""
        log_info "Crontab entry to add:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "$CRON_ENTRY"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        read -p "Add this to crontab now? (y/n): " confirm

        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            # Add to crontab
            (crontab -l 2>/dev/null | grep -v "luvora-cron"; echo "# Luvora Spark Delivery"; echo "$CRON_ENTRY") | crontab -
            log_success "Added to crontab"

            echo ""
            log_success "Crontab setup complete!"
            echo ""
            echo "Management commands:"
            echo "  crontab -l                           # List crontab"
            echo "  tail -f $LOG_DIR/cron.log            # View logs"
            echo "  crontab -e                           # Edit crontab"
        else
            log_info "Skipped adding to crontab. Run 'crontab -e' manually to add it."
        fi
        ;;

    3)
        log_info "Manual setup instructions:"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Option 1: Systemd Timer"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "sudo cp $SCRIPT_DIR/luvora-cron.service /etc/systemd/system/"
        echo "sudo cp $SCRIPT_DIR/luvora-cron.timer /etc/systemd/system/"
        echo "sudo systemctl daemon-reload"
        echo "sudo systemctl enable luvora-cron.timer"
        echo "sudo systemctl start luvora-cron.timer"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Option 2: Crontab"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "crontab -e"
        echo "# Add this line:"
        echo "* * * * * APP_URL=$APP_URL CRON_SECRET=$CRON_SECRET $SCRIPT_DIR/cron-deliver.sh >> $LOG_DIR/cron.log 2>&1"
        echo ""
        ;;

    *)
        log_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
log_info "For detailed documentation, see: $PROJECT_DIR/docs/CRON_SETUP.md"
echo ""
