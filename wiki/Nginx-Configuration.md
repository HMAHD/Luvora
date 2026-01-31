# Nginx Configuration

Complete Nginx configurations for production and staging environments.

---

## Production Configuration

**Domain**: luvora.love
**Port**: 3002

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

### Apply Production Config

```bash
# Create the config file
sudo nano /etc/nginx/sites-available/luvora-production

# Enable it
sudo ln -sf /etc/nginx/sites-available/luvora-production /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Staging Configuration

**Domain**: staging.luvora.love
**Port**: 3003

```nginx
# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name staging.luvora.love;

    return 301 https://$host$request_uri;
}

# HTTPS - Staging on port 3003
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name staging.luvora.love;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/staging.luvora.love/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.luvora.love/privkey.pem;
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

    # Proxy to Next.js (Staging on port 3003)
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

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:3003;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Logs
    access_log /var/log/nginx/luvora-staging-access.log;
    error_log /var/log/nginx/luvora-staging-error.log;
}
```

### Apply Staging Config

```bash
# Create the config file
sudo nano /etc/nginx/sites-available/luvora-staging

# Enable it
sudo ln -sf /etc/nginx/sites-available/luvora-staging /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Common Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload Nginx (graceful restart)
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/luvora-production-error.log
sudo tail -f /var/log/nginx/luvora-staging-error.log

# View access logs
sudo tail -f /var/log/nginx/luvora-production-access.log
sudo tail -f /var/log/nginx/luvora-staging-access.log
```

---

## Troubleshooting

### Conflicting server names

If you see warnings about conflicting server names:

```bash
# List all enabled sites
ls -la /etc/nginx/sites-enabled/

# Remove old/duplicate configs
sudo rm /etc/nginx/sites-enabled/old-config

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate Issues

```bash
# Check certificates
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Renew specific domain
sudo certbot renew --cert-name luvora.love
```
