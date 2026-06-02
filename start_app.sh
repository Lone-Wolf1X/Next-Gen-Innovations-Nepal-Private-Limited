cd /var/www/nextgen
npm install
sudo npm install -g pm2
pm2 start server/app.js --name 'next-gen-app'
pm2 save
pm2 startup | grep -v 'sudo env' | sh
