# Digital Ocean Deployment Guide (Best Practices)

This guide outlines the professional way to deploy your **Next Gen Innovations** project to an existing Digital Ocean Droplet.

## 🚀 Best Practices for Deployment

1. **Use a Dedicated Directory**: Store your apps in `/var/www/` for organization and security.
2. **Git Workflow**: Always deploy via `git clone` and `git pull`. Never manually upload files (except `.env`).
3. **Process Management**: Use `PM2` to keep your Node.js app running 24/7.
4. **Reverse Proxy**: Use `Nginx` to handle web traffic. It's faster and more secure than hitting Node.js directly.

---

## 1. Professional Folder Structure
Connect to your droplet and create a dedicated folder:
```bash
sudo mkdir -p /var/www/next-gen-innovations
sudo chown -R $USER:$USER /var/www/next-gen-innovations
cd /var/www/next-gen-innovations
```

## 2. Clone from GitHub
Instead of creating a "new folder" manually, let Git do it:
```bash
git clone https://github.com/Lone-Wolf1X/Next-Gen-Innovations-Nepal-Private-Limited.git .
npm install
```
*Note: The `.` at the end clones it INTO the current folder instead of creating a subfolder.*

## 3. Database Setup (PostgreSQL)
If not already installed:
```bash
sudo apt install postgresql postgresql-contrib -y
sudo -i -u postgres psql
# CREATE DATABASE next_gen_db;
# CREATE USER next_gen_user WITH PASSWORD 'your_password';
# GRANT ALL PRIVILEGES ON DATABASE next_gen_db TO next_gen_user;
\q
exit
```

## 4. Environment Configuration
Create the `.env` file (this is NOT tracked by Git for security):
```bash
nano .env
```
Paste your production settings:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=next_gen_db
DB_USER=next_gen_user
DB_PASSWORD=your_password
```

## 5. Initialize Schema & Seed Admin
```bash
psql -U next_gen_user -d next_gen_db -f server/db/schema.sql
node scripts/seed-admin.js
```

## 6. Process Management with PM2
```bash
sudo npm install -g pm2
pm2 start server/app.js --name "next-gen-api"
pm2 save
pm2 startup
```

## 7. Setup Nginx Reverse Proxy
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/next-gen
```
Add this config:
```nginx
server {
    listen 80;
    server_name your_domain.com; # or your IP

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Link it and restart:
```bash
sudo ln -s /etc/nginx/sites-available/next-gen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔄 How to Update in the Future
When you make changes locally and push to GitHub, just run this on your server:
```bash
cd /var/www/next-gen-innovations
git pull origin main
npm install # if you added new packages
pm2 restart next-gen-api
```
