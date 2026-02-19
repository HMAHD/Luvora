#!/bin/bash

################################################################################
# Luvora Spark Delivery Cron Script
# Runs every minute to deliver scheduled sparks to users
#
# Usage: Add to crontab:
#   * * * * * /path/to/Luvora/scripts/cron-deliver.sh >> /var/log/luvora-cron.log 2>&1
################################################################################

# Configuration
APP_URL="${APP_URL:-http://localhost:3000}"
CRON_SECRET="${CRON_SECRET:?ERROR: CRON_SECRET environment variable is required}"
LOG_DIR="/var/log/luvora"
MAX_RETRIES=3
RETRY_DELAY=5

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Log file with date
LOG_FILE="$LOG_DIR/cron-deliver-$(date +%Y-%m-%d).log"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to make API call with retries
call_api() {
    local attempt=1
    local response
    local http_code

    while [ $attempt -le $MAX_RETRIES ]; do
        log "Attempt $attempt/$MAX_RETRIES: Calling delivery endpoint..."

        # Make the API call and capture both response body and HTTP code
        response=$(curl -s -w "\n%{http_code}" \
            -H "Authorization: Bearer $CRON_SECRET" \
            -H "Content-Type: application/json" \
            --max-time 60 \
            "$APP_URL/api/cron/deliver")

        # Extract HTTP code (last line)
        http_code=$(echo "$response" | tail -n1)
        # Extract response body (everything except last line)
        body=$(echo "$response" | sed '$d')

        # Check if successful
        if [ "$http_code" = "200" ]; then
            log "✓ SUCCESS (HTTP $http_code)"
            log "Response: $body"

            # Parse and log key metrics if jq is available
            if command -v jq &> /dev/null; then
                eligible=$(echo "$body" | jq -r '.eligible // 0')
                sent=$(echo "$body" | jq -r '.sent // 0')
                errors=$(echo "$body" | jq -r '.errors // 0')
                duration=$(echo "$body" | jq -r '.duration // "N/A"')

                log "Metrics: eligible=$eligible sent=$sent errors=$errors duration=$duration"
            fi

            return 0
        else
            log "✗ FAILED (HTTP $http_code) - Attempt $attempt/$MAX_RETRIES"
            log "Response: $body"

            if [ $attempt -lt $MAX_RETRIES ]; then
                log "Retrying in ${RETRY_DELAY}s..."
                sleep $RETRY_DELAY
            fi
        fi

        attempt=$((attempt + 1))
    done

    log "✗✗✗ ALL RETRIES EXHAUSTED - Delivery failed"
    return 1
}

# Main execution
log "========================================="
log "Starting Luvora spark delivery cron job"
log "App URL: $APP_URL"

# Check if app is reachable
if ! curl -s --max-time 5 "$APP_URL" > /dev/null; then
    log "✗✗✗ ERROR: App is not reachable at $APP_URL"
    exit 1
fi

# Call the delivery API
if call_api; then
    log "Cron job completed successfully"
    exit 0
else
    log "Cron job failed"
    exit 1
fi
