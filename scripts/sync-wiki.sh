#!/bin/bash

# Sync wiki/ directory to GitHub Wiki
# Run this after making changes to documentation in wiki/ directory

set -e

echo "📚 Syncing Documentation to GitHub Wiki"
echo "========================================"
echo ""

WIKI_DIR="/Users/akash/Documents/Luvora.wiki"
SOURCE_DIR="$(pwd)/wiki"

# Check if we're in the right directory
if [ ! -d "wiki" ]; then
    echo "❌ Error: wiki/ directory not found"
    echo "Please run this script from the Luvora repository root"
    exit 1
fi

# Check if wiki repo exists
if [ ! -d "$WIKI_DIR" ]; then
    echo "❌ Error: Wiki repository not found at $WIKI_DIR"
    echo "Clone it first with: cd /Users/akash/Documents && git clone https://github.com/HMAHD/Luvora.wiki.git"
    exit 1
fi

echo "1️⃣  Pulling latest wiki changes..."
cd "$WIKI_DIR"
git pull origin master

echo ""
echo "2️⃣  Copying updated documentation..."
cp "$SOURCE_DIR"/*.md .
echo "✅ Copied $(ls "$SOURCE_DIR"/*.md | wc -l) files"

echo ""
echo "3️⃣  Checking for changes..."
if [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️  No changes to sync"
    exit 0
fi

git status --short

echo ""
echo "4️⃣  Committing changes..."
git add .
git commit -m "Update documentation from repo

$(git diff --cached --name-only | sed 's/^/- /')"

echo ""
echo "5️⃣  Pushing to GitHub Wiki..."
git push origin master

echo ""
echo "✅ Documentation synced successfully!"
echo "View at: https://github.com/HMAHD/Luvora/wiki"
echo ""
