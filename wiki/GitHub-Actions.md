# GitHub Actions CI/CD

Automated deployment workflows for Luvora.

---

## Workflows

### Production Deployment

**File**: `.github/workflows/deploy-production.yml`

**Triggers**:
- Push to `main` branch
- Manual trigger via GitHub Actions UI

**Jobs**:

1. **Test Job**
   - Runs linting with `bun run lint`
   - Runs tests with `bun test`
   - Must pass before deployment

2. **Deploy Job** (only if tests pass)
   - Connects to VPS via SSH
   - Pulls latest code from `main`
   - Installs dependencies
   - Builds application
   - Reloads PM2 process (zero-downtime)

3. **Health Check**
   - Verifies deployment at https://luvora.love/api/health

4. **Sentry Notification**
   - Tracks deployment in Sentry

---

### Staging Deployment

**File**: `.github/workflows/deploy-staging.yml`

**Triggers**:
- Push to `develop` branch
- Manual trigger via GitHub Actions UI

**Jobs**:

1. **Deploy Job**
   - Connects to VPS via SSH
   - Pulls latest code from `develop`
   - Installs dependencies
   - Builds application
   - Reloads PM2 process

2. **Health Check**
   - Verifies deployment at https://staging.luvora.love/api/health

3. **Sentry Notification**
   - Tracks deployment in Sentry

---

## Required Secrets

Configure these in GitHub Settings → Secrets → Actions:

### Production Secrets

- `PRODUCTION_VPS_HOST` - VPS IP address
- `PRODUCTION_VPS_USER` - SSH username (usually `root`)
- `PRODUCTION_VPS_SSH_KEY` - Private SSH key for authentication

### Staging Secrets

- `STAGING_VPS_HOST` - Staging VPS IP address
- `STAGING_VPS_USER` - SSH username
- `STAGING_VPS_SSH_KEY` - Private SSH key for staging

### Shared Secrets

- `SENTRY_AUTH_TOKEN` - Sentry authentication token

---

## How It Works

### Deployment Flow

1. Developer pushes code to `main` (production) or `develop` (staging)
2. GitHub Actions workflow is triggered
3. Tests run (production only)
4. If tests pass, SSH connection is established to VPS
5. Code is pulled from repository
6. Dependencies are installed with `bun install --frozen-lockfile`
7. Application is built with `bun run build`
8. PM2 process is reloaded with zero-downtime
9. Health check confirms deployment success
10. Sentry is notified of the deployment

### Zero-Downtime Deployment

The workflow uses `pm2 reload` instead of `pm2 restart`:

```bash
pm2 reload luvora-production-3002 --update-env
```

This ensures:
- No request interruption
- Graceful shutdown of old process
- New process starts before old one stops

---

## Manual Trigger

You can manually trigger deployments from GitHub:

1. Go to **Actions** tab in GitHub
2. Select the workflow (Production or Staging)
3. Click **Run workflow**
4. Select the branch
5. Click **Run workflow** button

---

## Troubleshooting Failed Deployments

### Check Workflow Logs

1. Go to **Actions** tab in GitHub
2. Click on the failed workflow run
3. Expand each step to see detailed logs
4. Look for error messages

### Common Issues

#### SSH Connection Failed

- Verify `*_VPS_HOST` secret is correct
- Verify `*_VPS_USER` secret is correct
- Verify `*_VPS_SSH_KEY` is valid and has correct permissions

#### Build Failed

- Check if .env.local exists on VPS
- Verify dependencies are compatible
- Check for TypeScript errors

#### Health Check Failed

- Verify PM2 process is running: `pm2 list`
- Check application logs: `pm2 logs`
- Verify Nginx is running: `sudo systemctl status nginx`
- Test endpoint manually: `curl https://luvora.love/api/health`

#### Bun Command Not Found

- Verify Bun is installed on VPS
- Check if PATH includes Bun: `echo $PATH`
- Verify setup script added Bun to PATH

---

## Deployment Notifications

### Sentry Integration

The workflow notifies Sentry of deployments, which helps:
- Track which errors occur in which deployment
- Correlate performance changes with deployments
- Understand deployment frequency and stability

### Viewing Deployments in Sentry

1. Go to Sentry dashboard
2. Select the Luvora project
3. Navigate to **Releases**
4. See all deployments with their commits

---

## Best Practices

1. **Always test locally** before pushing to `main` or `develop`
2. **Run tests** before pushing: `bun test && bun run lint`
3. **Use staging** for testing changes before production
4. **Monitor deployments** in GitHub Actions and Sentry
5. **Check logs** after deployment: `pm2 logs`
6. **Never commit secrets** to the repository
7. **Keep dependencies updated** to avoid build failures

---

## Disabling Auto-Deployment

If you need to prevent auto-deployment temporarily:

### Option 1: Pause in GitHub

1. Go to **Actions** tab
2. Select the workflow
3. Click **Disable workflow**

### Option 2: Edit Workflow

Comment out the trigger in the workflow file:

```yaml
on:
  # push:
  #   branches: [main]
  workflow_dispatch:  # Keep manual trigger
```
