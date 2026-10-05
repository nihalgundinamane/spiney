# Upload Spinly to GitHub

## 1. Prepare
Make sure Git is installed (`git --version`) and you have a GitHub account. The included `.gitignore` already keeps `node_modules/` and `dist/` out of the repo.

## 2. Create the repository on GitHub
1. Go to https://github.com/new
2. Name it `spinly`
3. Leave "Add a README", ".gitignore" and "license" **unchecked** (the project already has them)
4. Click **Create repository** and copy the repo URL

## 3. Push from your computer
Run these inside the project folder:

```bash
git init
git add .
git commit -m "Initial commit: Spinly random picker"
git branch -M main
git remote add origin https://github.com/<your-username>/spinly.git
git push -u origin main
```

Replace `<your-username>` with your GitHub username. If asked to log in, use your GitHub username and a Personal Access Token (Settings > Developer settings > Personal access tokens) as the password, or sign in through GitHub Desktop / `gh auth login`.

## 4. Later changes
```bash
git add .
git commit -m "Describe your change"
git push
```

## 5. Optional: host it free with GitHub Pages
1. In `vite.config.js`, set `base: "/spinly/"` inside `defineConfig`
2. Run `npm run build`
3. Install the deploy helper: `npm install -D gh-pages`
4. Add `"deploy": "gh-pages -d dist"` to `scripts` in `package.json`
5. Run `npm run deploy`
6. In the repo go to **Settings > Pages**, choose branch `gh-pages` and folder `/ (root)`
7. Your site will be live at `https://<your-username>.github.io/spinly/`
