# Git Quick Reference — STELLY-BEST VENTURES Project

## First Time Setup (do once)

```bash
# Navigate to your project folder
cd path/to/stellybest-website

# Initialize Git
git init

# Add all files
git add .

# Create your first commit
git commit -m "Initial project setup with frontend and folder structure"

# Connect to your GitHub repo (replace with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/stellybest-website.git

# Push to GitHub
git push -u origin main
```

## Daily Workflow (every time you make changes)

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Describe what you changed here"

# Push to GitHub
git push
```

## Useful Commands

```bash
# Check what files have changed
git status

# See your commit history
git log --oneline

# Undo changes to a file (before committing)
git checkout -- filename.html

# Go back to a previous commit (view only)
git checkout abc1234

# Go back to latest
git checkout main
```

## Good Commit Message Examples

- "Added Paystack payment integration to checkout"
- "Fixed mobile nav not closing after page switch"
- "Updated product prices per client request"
- "Added order processing API endpoints"
- "Fixed cart not showing product images"

## Rules to Live By

1. **Commit often** — small, frequent commits are better than huge rare ones
2. **Write clear messages** — future you will thank present you
3. **Never commit .env** — the .gitignore handles this, but double check
4. **Pull before you push** — if working from multiple machines, run `git pull` first
5. **When in doubt, `git status`** — it tells you exactly what's going on
