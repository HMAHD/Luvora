# PM2 Process Management

Guide for managing Luvora processes with PM2.

---

## Process Configuration

From `ecosystem.config.js`:

### Production (Port 3002)

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

### Staging (Port 3003)

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

---

## Common PM2 Commands

### Process Control

```bash
# List all processes
pm2 list

# Start a process
pm2 start ecosystem.config.js --only luvora-production-3002

# Stop a process
pm2 stop luvora-production-3002

# Restart a process (with downtime)
pm2 restart luvora-production-3002

# Reload a process (zero-downtime)
pm2 reload luvora-production-3002

# Delete a process
pm2 delete luvora-production-3002
```

### Monitoring

```bash
# View logs (live)
pm2 logs luvora-production-3002

# View logs (last 50 lines)
pm2 logs luvora-production-3002 --lines 50

# View only error logs
pm2 logs luvora-production-3002 --err

# Real-time monitoring dashboard
pm2 monit

# Detailed process info
pm2 show luvora-production-3002
```

### Save & Startup

```bash
# Save current process list
pm2 save

# Setup PM2 to start on boot
pm2 startup

# This will output a command to run with sudo
# Copy and run that command

# After running the startup command, save again
pm2 save
```

### Environment Updates

```bash
# Reload with updated environment variables
pm2 reload luvora-production-3002 --update-env

# Restart with updated environment variables
pm2 restart luvora-production-3002 --update-env
```

---

## Troubleshooting

### Process Not Starting

```bash
# Check logs for errors
pm2 logs luvora-production-3002 --lines 100

# Check if port is already in use
sudo lsof -i :3002

# Delete and restart
pm2 delete luvora-production-3002
pm2 start ecosystem.config.js --only luvora-production-3002
```

### High Memory Usage

```bash
# Check resource usage
pm2 list

# View detailed metrics
pm2 show luvora-production-3002

# Reload to clear memory
pm2 reload luvora-production-3002
```

### Process Keeps Crashing

```bash
# View error logs
pm2 logs luvora-production-3002 --err --lines 200

# Check if .env.local exists
ls -la /home/luvora-production/Luvora/.env.local

# Verify build is successful
cd /home/luvora-production/Luvora
bun run build

# Check Node/Bun version
node --version
bun --version
```

---

## Best Practices

1. **Always use `reload` instead of `restart`** for zero-downtime deployments
2. **Run `pm2 save` after making changes** to persist configuration
3. **Check logs before and after deployments** to catch issues early
4. **Use `--update-env` flag** when environment variables change
5. **Monitor resource usage** regularly with `pm2 list`

---

## Advanced Usage

### Log Management

```bash
# Clear all logs
pm2 flush

# Rotate logs (requires pm2-logrotate)
pm2 install pm2-logrotate
```

### Process Metrics

```bash
# Enable metrics collection
pm2 install pm2-metrics

# View web dashboard
pm2 web
```

### Clustering (Multiple Instances)

To run multiple instances for load balancing, update `ecosystem.config.js`:

```javascript
{
  instances: 2,  // or 'max' for CPU count
  exec_mode: 'cluster',
}
```

Then reload:

```bash
pm2 reload luvora-production-3002
```
