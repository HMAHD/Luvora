# Luvora Production Deployment Guide

Complete guide for deploying Luvora to production on a VPS.

---

## Prerequisites

- **VPS** with Ubuntu 20.04+ or Debian 11+
- **Domain** pointed to your VPS IP
- **SSH access** to your VPS
- **GitHub repository** access

---

## 1. VPS Initial Setup

### Install Required Software

```bash
# Run the automated setup script
curl -fsSL https://raw.githubusercontent.com/HMAHD/Luvora/main/scripts/setup-production.sh | bash
```

This script will:
- Install Bun (JavaScript runtime)
- Install PM2 (process manager)
- Clone the repository to `/home/luvora-production/Luvora`
- Create `.env.local` template
- Install dependencies
- Build the application
- Start PM2 process on port 3002

### Configure Environment Variables

Edit the `.env.local` file:

```bash
nano /home/luvora-production/Luvora/.env.local
```

Add your production secrets (see `.env.example` for all available options).

---

## 2. Nginx Configuration

### Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### Create Production Config

Create `/etc/nginx/sites-available/luvora-production`:

```nginx
# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name luvora.love www.luvora.love;

    return 301 https://$host$request_uri;
}

# HTTPS - Production on port 3002
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name luvora.love www.luvora.love;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/luvora.love/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/luvora.love/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

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
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss;

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

### Enable Configuration

```bash
# Remove default/old configs
sudo rm /etc/nginx/sites-enabled/default

# Enable production config
sudo ln -sf /etc/nginx/sites-available/luvora-production /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 3. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d luvora.love -d www.luvora.love

# Auto-renewal (already set up by certbot)
sudo systemctl status certbot.timer
```

---

## 4. PM2 Configuration

The PM2 configuration is in `ecosystem.config.js`:

```javascript
{
  name: 'luvora-production-3002',
  script: 'node_modules/next/dist/bin/next',
  args: 'start',
  cwd: '/home/luvora-production/Luvora',
  env: {
    NODE_ENV: 'production',
    PORT: 3002,
  },
  instances: 1,
  exec_mode: 'cluster',
}
```

### PM2 Commands

```bash
# View status
pm2 list

# View logs
pm2 logs luvora-production-3002

# Restart
pm2 restart luvora-production-3002

# Reload (zero-downtime)
pm2 reload luvora-production-3002

# Stop
pm2 stop luvora-production-3002

# Save PM2 configuration
pm2 save

# Setup PM2 startup on boot
pm2 startup
```

---

## 5. GitHub Actions CI/CD

### Setup Secrets

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

- `PRODUCTION_VPS_HOST` - Your VPS IP address
- `PRODUCTION_VPS_USER` - SSH username (usually `root`)
- `PRODUCTION_VPS_SSH_KEY` - Private SSH key for authentication
- `SENTRY_AUTH_TOKEN` - Sentry authentication token

### How It Works

The workflow (`.github/workflows/deploy-production.yml`) triggers on:
- Push to `main` branch
- Manual trigger via GitHub Actions UI

**Workflow Steps:**
1. **Test Job**: Runs linting and tests
2. **Deploy Job** (only if tests pass):
   - Connects to VPS via SSH
   - Pulls latest code
   - Installs dependencies
   - Builds application
   - Reloads PM2 process (zero-downtime)
3. **Health Check**: Verifies deployment
4. **Sentry Notification**: Tracks deployment

---

## 6. Verification

### Check Application Status

```bash
# Check PM2
pm2 list

# Check application logs
pm2 logs luvora-production-3002 --lines 50

# Test local endpoint
curl http://localhost:3002/api/health

# Test public endpoint
curl https://luvora.love/api/health
```

### Check Nginx Status

```bash
# Test configuration
sudo nginx -t

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/luvora-production-error.log

# View access logs
sudo tail -f /var/log/nginx/luvora-production-access.log
```

---

## 7. Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs luvora-production-3002

# Check if port is in use
sudo lsof -i :3002

# Restart PM2
pm2 restart luvora-production-3002
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check error logs
sudo tail -100 /var/log/nginx/luvora-production-error.log
```

### Deployment Fails

```bash
# SSH into VPS
ssh root@your-vps-ip

# Check if .env.local exists
cat /home/luvora-production/Luvora/.env.local

# Manually run deployment steps
cd /home/luvora-production/Luvora
git pull origin main
bun install --frozen-lockfile
bun run build
pm2 reload luvora-production-3002
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## 8. Maintenance

### Update Application

```bash
# Via CI/CD (recommended)
git push origin main

# Or manually
cd /home/luvora-production/Luvora
git pull origin main
bun install --frozen-lockfile
bun run build
pm2 reload luvora-production-3002
```

### Monitor Application

```bash
# PM2 monitoring
pm2 monit

# Check resource usage
pm2 list

# View detailed info
pm2 show luvora-production-3002
```

### Backup

```bash
# Backup .env.local
cp /home/luvora-production/Luvora/.env.local ~/env-backup-$(date +%Y%m%d).local

# Backup PM2 config
pm2 save
```

---

## 9. Security Checklist

- ✅ Firewall configured (allow 80, 443, SSH only)
- ✅ SSH key authentication enabled
- ✅ SSL certificate installed and auto-renewing
- ✅ `.env.local` contains production secrets
- ✅ Nginx security headers configured
- ✅ PM2 runs as non-root user (if possible)
- ✅ Regular security updates (`apt update && apt upgrade`)

---

## Support

For issues or questions:
- Check logs: `pm2 logs luvora-production-3002`
- Review GitHub Actions workflow runs
- Check Sentry for error tracking
