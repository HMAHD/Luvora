# Luvora Wiki Documentation

This directory contains all documentation pages for the Luvora GitHub wiki.

## How to Upload to GitHub Wiki

### Method 1: GitHub Web Interface

1. Go to your repository: https://github.com/HMAHD/Luvora
2. Click on the **Wiki** tab
3. Click **Create the first page** (or **New Page** if wiki exists)
4. For each file in this `wiki/` directory:
   - Create a new page
   - Use the filename (without .md) as the page title
   - Copy the content from the file
   - Click **Save Page**

### Method 2: Clone Wiki Repository

GitHub wikis are separate git repositories. You can clone and manage them like code:

```bash
# Clone the wiki repository
git clone https://github.com/HMAHD/Luvora.wiki.git

# Copy all wiki files
cp wiki/*.md Luvora.wiki/

# Commit and push
cd Luvora.wiki
git add .
git commit -m "Add complete documentation"
git push origin master
```

## Wiki Pages to Create

1. **Home.md** - Wiki homepage with navigation
2. **Production-Deployment.md** - Production deployment guide
3. **Staging-Deployment.md** - Staging deployment guide
4. **Nginx-Configuration.md** - Nginx configs for both environments
5. **PM2-Process-Management.md** - PM2 commands and troubleshooting
6. **GitHub-Actions.md** - CI/CD workflow documentation

## After Upload

Once uploaded, the wiki will be accessible at:
https://github.com/HMAHD/Luvora/wiki

## Deleting Old Docs from Repo

After moving documentation to the wiki, you can delete these files from the main repository:

```bash
# Remove documentation files
rm -rf docs/

# Keep only essential files in repo
git add -u
git commit -m "docs: move documentation to GitHub wiki"
git push
```

## Maintaining the Wiki

- Keep this `wiki/` directory in your repo as source of truth
- Edit files here, then update the wiki
- Or enable wiki contributors to edit directly on GitHub
