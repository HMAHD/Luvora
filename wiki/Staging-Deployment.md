# Luvora Staging Deployment Guide

Quick reference for deploying Luvora staging environment.

---

## Environment Details

- **Domain**: staging.luvora.love
- **Port**: 3003
- **Directory**: /home/luvora-staging/Luvora
- **PM2 Process**: luvora-staging-3003

---

## Nginx Configuration

The correct Nginx configuration is in `docs/nginx-staging.conf`.

### Apply the configuration:

```bash
# Copy the config
sudo cp docs/nginx-staging.conf /etc/nginx/sites-available/luvora-staging

# Enable it
sudo ln -sf /etc/nginx/sites-available/luvora-staging /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Manual Deployment

Staging uses manual deployment (no GitHub Actions workflow).

### Deploy steps:

```bash
# SSH into VPS
ssh root@your-vps-ip

# Navigate to staging directory
cd /home/luvora-staging/Luvora

# Pull latest changes
git pull origin develop  # or whichever branch you use for staging

# Install dependencies
bun install --frozen-lockfile

# Build the application
bun run build

# Reload PM2 process (zero-downtime)
pm2 reload luvora-staging-3003

# Check status
pm2 list
pm2 logs luvora-staging-3003 --lines 50
```

---

## PM2 Configuration

From `ecosystem.config.js`:

```javascript
{
  name: 'luvora-staging-3003',
  script: 'node_modules/next/dist/bin/next',
  args: 'start',
  cwd: '/home/luvora-staging/Luvora',
  env: {
    NODE_ENV: 'production',
    PORT: 3003,
  },
  instances: 1,
  exec_mode: 'cluster',
}
```

### Useful PM2 commands:

```bash
pm2 list                                  # View all processes
pm2 logs luvora-staging-3003             # View logs
pm2 restart luvora-staging-3003          # Restart process
pm2 reload luvora-staging-3003           # Zero-downtime reload
pm2 stop luvora-staging-3003             # Stop process
pm2 start ecosystem.config.js --only luvora-staging-3003  # Start process
```

---

## Verification

```bash
# Test local endpoint
curl http://localhost:3003/api/health

# Test public endpoint
curl https://staging.luvora.love/api/health

# Check PM2 status
pm2 list

# Check Nginx logs
sudo tail -f /var/log/nginx/luvora-staging-error.log
sudo tail -f /var/log/nginx/luvora-staging-access.log
```

---

## Troubleshooting

### Staging not accessible

```bash
# Check if PM2 process is running
pm2 list

# Check if port 3003 is in use
sudo lsof -i :3003

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -100 /var/log/nginx/luvora-staging-error.log

# Restart everything
pm2 restart luvora-staging-3003
sudo systemctl restart nginx
```

### Build fails

```bash
# Check if .env.local exists
ls -la /home/luvora-staging/Luvora/.env.local

# Check bun is available
bun --version

# Try clean build
cd /home/luvora-staging/Luvora
rm -rf .next
bun install --frozen-lockfile
bun run build
```

---

## SSL Certificate

Staging uses Let's Encrypt with its own certificate for staging.luvora.love.

```bash
# Verify certificate
sudo certbot certificates

# Renew manually if needed
sudo certbot renew
```

---

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md).
