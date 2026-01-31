# 📚 Documentation

All Luvora documentation is maintained in the **GitHub Wiki**.

## View Documentation

👉 **https://github.com/HMAHD/Luvora/wiki**

## Available Guides

- **[Production Deployment](https://github.com/HMAHD/Luvora/wiki/Production-Deployment)** - Complete guide for luvora.love
- **[Staging Deployment](https://github.com/HMAHD/Luvora/wiki/Staging-Deployment)** - Guide for staging.luvora.love
- **[Nginx Configuration](https://github.com/HMAHD/Luvora/wiki/Nginx-Configuration)** - Production and staging configs
- **[PM2 Process Management](https://github.com/HMAHD/Luvora/wiki/PM2-Process-Management)** - Managing processes
- **[GitHub Actions](https://github.com/HMAHD/Luvora/wiki/GitHub-Actions)** - CI/CD workflows

## Contributing to Documentation

Documentation source files are in the `wiki/` directory:

1. Edit files in `wiki/` directory
2. Commit changes to the main repo
3. Sync to GitHub Wiki:

```bash
cd /Users/akash/Documents/Luvora.wiki
git pull origin master
cp ../Luvora/wiki/*.md .
git add .
git commit -m "Update documentation"
git push origin master
```

Or use the automated script:

```bash
./scripts/sync-wiki.sh
```

---

**Note:** Do not create documentation in `/docs/` - it will be ignored. All docs go to the wiki.
