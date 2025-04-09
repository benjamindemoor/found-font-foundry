# Instructions for Pushing to GitHub

## 1. Create a GitHub Repository

1. Go to https://github.com/new
2. Enter "found-font-foundry" as the repository name
3. Add a description: "A growing collection of fonts discovered in the wild and everywhere in between."
4. Choose whether to make it public or private
5. Do NOT initialize with a README, .gitignore, or license as we already have these files
6. Click "Create repository"

## 2. Push Your Repository (Choose a Method)

### Method 1: SSH (If You Have SSH Set Up)

```bash
git remote set-url origin git@github.com:benjamindemoor/found-font-foundry.git
git push -u origin main
```

### Method 2: HTTPS with Personal Access Token

1. Generate a personal access token on GitHub:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token"
   - Give it a name like "Found Font Foundry Push"
   - Check the "repo" scope
   - Click "Generate token" and copy the token

2. Push with your username and the token as password:
```bash
git remote set-url origin https://github.com/benjamindemoor/found-font-foundry.git
git push -u origin main
```
When prompted, enter your GitHub username and use the personal access token as the password.

### Method 3: GitHub CLI (If Installed)

```bash
# Install GitHub CLI if needed
brew install gh  # macOS with Homebrew

# Log in to GitHub
gh auth login

# Create a repository and push
gh repo create found-font-foundry --private --source=. --remote=origin --push
``` 