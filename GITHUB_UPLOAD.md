# GitHub Upload Instructions

## ✅ Git Setup Complete!

Your repository is ready to push to GitHub with:
- Email: abhi.pwn2020@gmail.com
- Name: Abhishek
- All files committed successfully

## 📝 Next Steps to Upload to GitHub:

### Option 1: Using GitHub Website (Easiest)

1. **Go to GitHub**: https://github.com/new
   
2. **Create New Repository**:
   - Repository name: `next-gen-innovations-nepal` (or any name you prefer)
   - Description: `Premium IT company website with dark/light theme`
   - Keep it **Public** (or Private if you prefer)
   - **DO NOT** initialize with README (we already have one)
   - Click "Create repository"

3. **Copy the repository URL** (will look like):
   ```
   https://github.com/YOUR_USERNAME/next-gen-innovations-nepal.git
   ```

4. **Run these commands** in your terminal:
   ```bash
   cd "d:/Next Gen"
   git remote add origin https://github.com/YOUR_USERNAME/next-gen-innovations-nepal.git
   git branch -M main
   git push -u origin main
   ```

### Option 2: Using GitHub CLI (If installed)

```bash
cd "d:/Next Gen"
gh repo create next-gen-innovations-nepal --public --source=. --remote=origin
git push -u origin main
```

## 🚀 After Pushing to GitHub:

### Enable GitHub Pages (Free Hosting!)

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes
7. Your site will be live at:
   ```
   https://YOUR_USERNAME.github.io/next-gen-innovations-nepal/
   ```

## 📊 Repository Stats

- **Total Files**: 13
- **HTML Pages**: 6 (Home, About, Services, Technologies, Portfolio, Contact)
- **CSS Files**: 3 (styles.css, animations.css, pages.css)
- **JS Files**: 2 (main.js, animations.js)
- **Total Lines**: ~3,500+ lines of code

## 🎯 Features Included

✅ Dark/Light theme toggle
✅ Glassmorphism design
✅ Smooth animations
✅ Fully responsive
✅ Team section (Rita Devi, Abhishek, Yuvaraj Kumar, Bidur Pasman)
✅ SEO optimized
✅ Performance optimized

## 🔧 Troubleshooting

**If push fails with authentication error:**
1. You may need to create a Personal Access Token
2. Go to: https://github.com/settings/tokens
3. Generate new token (classic)
4. Select scopes: `repo` (all)
5. Use token as password when pushing

**Alternative: Use SSH**
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/next-gen-innovations-nepal.git
```

## 📱 Share Your Website

Once deployed on GitHub Pages, share:
```
🚀 Next Gen Innovations Nepal
https://YOUR_USERNAME.github.io/next-gen-innovations-nepal/

Premium IT company website built with:
✨ Dark/Light theme
🎨 Glassmorphism design
⚡ Smooth animations
📱 Fully responsive
```

---

**Ready to push!** Just create the GitHub repository and run the commands above. 🎉
