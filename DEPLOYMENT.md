# Luvora Deployment Guide

This guide covers deploying Luvora to a VPS with Nginx, PM2, and automated CI/CD.

## Table of Contents

- [Prerequisites](#prerequisites)
- [VPS Initial Setup](#vps-initial-setup)
- [Nginx Configuration](#nginx-configuration)
- [PM2 Setup](#pm2-setup)
- [Environment Variables](#environment-variables)
- [GitHub Actions Setup](#github-actions-setup)
- [Sentry Setup](#sentry-setup)
- [Telegram Webhook Setup](#telegram-webhook-setup)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- VPS with Ubuntu 22.04 LTS (minimum 2GB RAM recommended)
- Domain name configured (luvora.love with DNS pointing to your VPS)
- SSH access to your VPS
- GitHub repository with the codebase
- Node.js 20.x or later

## VPS Initial Setup

### 1. Connect to your VPS

```bash
ssh root@your-vps-ip
```

### 2. Create a non-root user (recommended)

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### 3. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash

# Add to PATH (if not already)
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
bun --version
```

### 4. Install PM2 globally

```bash
bun add -g pm2
```

### 5. Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 6. Install Certbot for SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7. Setup directory structure

```bash
# For production
mkdir -p /home/luvora-production
mkdir -p /home/luvora-production/logs

# For staging
mkdir -p /home/luvora-staging
mkdir -p /home/luvora-staging/logs
```

### 8. Clone repository

```bash
# Production
cd /home/luvora-production
git clone https://github.com/YOUR_USERNAME/luvora.git .

# Staging
cd /home/luvora-staging
git clone https://github.com/YOUR_USERNAME/luvora.git .
git checkout develop
```

## Nginx Configuration

### 1. Create Nginx config for production

```bash
sudo nano /etc/nginx/sites-available/luvora-production
```

Add this configuration:

```nginx
# Production - luvora.love
server {
    listen 80;
    listen [::]:80;
    server_name luvora.love www.luvora.love;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name luvora.love www.luvora.love;

    # SSL certificates (will be added by certbot)
    ssl_certificate /etc/letsencrypt/live/luvora.love/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/luvora.love/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    # Client body size
    client_max_body_size 10M;

    # Proxy to Next.js (Production on port 3002)
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:3002;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Logs
    access_log /var/log/nginx/luvora-production-access.log;
    error_log /var/log/nginx/luvora-production-error.log;
}
```

### 2. Create Nginx config for staging

```bash
sudo nano /etc/nginx/sites-available/luvora-staging
```

Add this configuration (similar to production but on port 3001):

```nginx
# Staging - staging.luvora.love
server {
    listen 80;
    listen [::]:80;
    server_name staging.luvora.love;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name staging.luvora.love;

    ssl_certificate /etc/letsencrypt/live/staging.luvora.love/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.luvora.love/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /_next/static {
        proxy_pass http://localhost:3003;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    access_log /var/log/nginx/luvora-staging-access.log;
    error_log /var/log/nginx/luvora-staging-error.log;
}
```

### 3. Enable sites and test

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/luvora-production /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/luvora-staging /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Get SSL certificates

```bash
# Production
sudo certbot --nginx -d luvora.love -d www.luvora.love

# Staging
sudo certbot --nginx -d staging.luvora.love

# Auto-renewal is set up automatically
```

## PM2 Setup

### 1. Create environment files

```bash
# Production
cd /home/luvora-production
nano .env.local
# Add your production environment variables (see .env.example)

# Staging
cd /home/luvora-staging
nano .env.local
# Add your staging environment variables
```

### 2. PM2 Ecosystem Configuration

The `ecosystem.config.js` file is already in the repository. It configures:

**Production:**
- PM2 Instance Name: **luvora-production-3002**
- Port: **3002**
- Directory: `/home/luvora-production`
- Logs: `/home/luvora-production/logs/`

**Staging:**
- PM2 Instance Name: **luvora-staging-3003**
- Port: **3003**
- Directory: `/home/luvora-staging`
- Logs: `/home/luvora-staging/logs/`

Note: Ports 3002 and 3003 are used to avoid conflicts with existing PM2 instances on ports 3000 and 3001.

### 3. Install dependencies and build

```bash
# Production
cd /home/luvora-production
bun install --frozen-lockfile
bun run build

# Staging
cd /home/luvora-staging
bun install --frozen-lockfile
bun run build
```

### 4. Start applications with PM2

```bash
# Start both apps using the ecosystem config from production
cd /home/luvora-production
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs
```

### 5. Useful PM2 commands

```bash
# View status
pm2 status

# View logs
pm2 logs luvora-production-3002
pm2 logs luvora-staging-3003

# Restart
pm2 restart luvora-production-3002
pm2 reload luvora-production-3002  # Zero-downtime reload

# Monitor
pm2 monit

# Stop
pm2 stop luvora-production-3002
pm2 delete luvora-production-3002
```

## System Cron Setup

### Configure cron for daily spark delivery

```bash
# Edit crontab
crontab -e
```

Add these entries:

```cron
# Luvora - Morning delivery (8:00 AM server time)
0 8 * * * curl -X POST https://luvora.love/api/cron/deliver?time=morning

# Luvora - Evening delivery (8:00 PM server time)
0 20 * * * curl -X POST https://luvora.love/api/cron/deliver?time=evening

# Health check every 5 minutes
*/5 * * * * curl -f https://luvora.love/api/health || echo "Health check failed at $(date)" >> /var/log/luvora-health-check.log
```

## GitHub Actions Setup

### 1. Add GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add these secrets:

**Deployment Secrets:**
- `STAGING_VPS_HOST` - Your VPS IP for staging
- `STAGING_VPS_USER` - SSH user (e.g., your username)
- `STAGING_VPS_SSH_KEY` - Private SSH key for staging
- `PRODUCTION_VPS_HOST` - Your VPS IP for production
- `PRODUCTION_VPS_USER` - SSH user
- `PRODUCTION_VPS_SSH_KEY` - Private SSH key for production

**Sentry (shared):**
- `SENTRY_AUTH_TOKEN` - For deployment notifications

**Note:** All other environment variables (PocketBase, LemonSqueezy, Telegram, etc.) are configured in `.env.local` files on the VPS, not in GitHub Secrets.

### 2. Setup SSH access for GitHub Actions

```bash
# On your local machine, generate a deploy key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key

# Copy the public key to your VPS
ssh-copy-id -i ~/.ssh/github_deploy_key.pub deploy@your-vps-ip

# Copy the PRIVATE key content to GitHub Secrets
cat ~/.ssh/github_deploy_key
# Add this to STAGING_VPS_SSH_KEY and PRODUCTION_VPS_SSH_KEY
```

## Sentry Setup

### 1. Create Sentry account

- Go to https://sentry.io
- Create a new project (Next.js)
- Get your DSN

### 2. Install Sentry SDK

```bash
npm install --save @sentry/nextjs
```

### 3. Add to environment variables

```bash
NEXT_PUBLIC_SENTRY_DSN=your_dsn_here
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
SENTRY_AUTH_TOKEN=your_auth_token
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

### 4. Configure uptime monitoring in Sentry

- Go to Sentry → Crons
- Create a new monitor for `/api/cron/deliver`
- Set schedule to match your cron jobs
- Get alerts when cron jobs fail

## Telegram Webhook Setup

### Run the setup script

```bash
cd /var/www/luvora-production
chmod +x scripts/setup-telegram-webhook.sh
./scripts/setup-telegram-webhook.sh
```

This will:
- Generate a webhook secret token
- Configure Telegram to send updates to your endpoint
- Verify the webhook is working

### Verify webhook

```bash
# Check webhook status
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

## Monitoring

### 1. Nginx logs

```bash
# Access logs
sudo tail -f /var/log/nginx/luvora-production-access.log

# Error logs
sudo tail -f /var/log/nginx/luvora-production-error.log
```

### 2. PM2 monitoring

```bash
# Real-time monitoring
pm2 monit

# Logs
pm2 logs

# Web dashboard (optional)
pm2 link <secret_key> <public_key>  # From pm2.io
```

### 3. System resources

```bash
# CPU and memory
htop

# Disk space
df -h

# Check running processes
ps aux | grep node
```

## Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs luvora-production-3002 --lines 100

# Check if port is in use
sudo lsof -i :3002

# Restart PM2
pm2 restart luvora-production-3002
```

### Nginx errors

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Database connection issues

```bash
# Test PocketBase connection
curl https://luvora.love/api/health

# Check if PocketBase is running
curl https://api.luvora.love/_/

# Check environment variables
pm2 show luvora-production-3002
```

### SSL certificate issues

```bash
# Renew certificates manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Deployment fails

```bash
# On VPS, check if user has proper permissions
chown -R $USER:$USER /home/luvora-production
chown -R $USER:$USER /home/luvora-staging

# Verify SSH key works
ssh -i ~/.ssh/github_deploy_key your-username@your-vps-ip

# Check GitHub Actions logs for detailed errors
```

## Performance Optimization

### Enable HTTP/2 and Brotli

Already configured in Nginx. HTTP/2 is enabled by default.

### Configure CDN (optional)

Consider using Cloudflare for:
- DDoS protection
- Global CDN
- Additional SSL features
- Analytics

### Database optimization

- PocketBase uses SQLite (lightweight and fast)
- Use indexes for frequently queried fields in PocketBase admin
- Monitor database size and consider backups
- For scaling beyond SQLite, PocketBase supports PostgreSQL and MySQL

## Backup Strategy

### 1. Database backups

PocketBase uses SQLite. Create automated backups:

```bash
# Create backup directory
mkdir -p /home/backups

# Create a daily backup script
nano /home/backup-pocketbase.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)

# Backup PocketBase database
cp /home/luvora-production/pb_data/data.db /home/backups/pb-production-$DATE.db
cp /home/luvora-staging/pb_data/data.db /home/backups/pb-staging-$DATE.db

# Keep only last 7 days
find /home/backups -name "pb-*.db" -mtime +7 -delete

echo "PocketBase backup completed: $DATE"
```

```bash
# Make executable
chmod +x /home/backup-pocketbase.sh

# Add to crontab (runs daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/backup-pocketbase.sh
```

### 2. Code and configuration backups

```bash
# Backup environment files (encrypted)
tar -czf /home/backups/env-$(date +%Y%m%d).tar.gz \
  /home/luvora-production/.env.local \
  /home/luvora-staging/.env.local

# Encrypt the backup
gpg -c /home/backups/env-$(date +%Y%m%d).tar.gz
```

## Security Checklist

- [ ] Firewall configured (ufw allow 22,80,443)
- [ ] SSH key-based authentication only
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Strong passwords for all services
- [ ] Environment variables never committed to git
- [ ] SSL certificates auto-renewing
- [ ] Regular backups configured
- [ ] Sentry monitoring errors
- [ ] Rate limiting configured (if needed)
- [ ] Database access restricted to application only

## Useful Commands Reference

```bash
# View application status
pm2 status

# View logs in real-time
pm2 logs luvora-production-3002 --lines 100

# Reload application (zero-downtime)
pm2 reload luvora-production-3002

# Check Nginx status
sudo systemctl status nginx

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check SSL certificates
sudo certbot certificates

# Renew SSL certificates
sudo certbot renew --dry-run

# Monitor system resources
htop

# Check disk space
df -h

# View system logs
sudo journalctl -u nginx -f
```

## Support

For issues or questions:
- Check the troubleshooting section
- Review GitHub Actions logs
- Check Sentry for error reports
- Monitor PM2 logs and Nginx logs
