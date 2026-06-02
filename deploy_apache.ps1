# PowerShell script to complete Next-Gen Innovations deployment
$sshKey = "E:\Next-Gen-Innovations-Nepal-Private-Limited\SSH Creditt\SSH Creditt\ssh-key-2026-05-27.key"
$serverIp = "161.118.189.212"
$user = "ubuntu"

Write-Host "1. Uploading Apache configuration file..." -ForegroundColor Cyan
scp -i "$sshKey" -o StrictHostKeyChecking=no nextgen.conf "${user}@${serverIp}:/tmp/nextgen.conf"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to upload Apache configuration."
    exit
}

Write-Host "2. Configuring Apache and PM2 on the server..." -ForegroundColor Cyan

$remoteCommands = @"
sudo mv /tmp/nextgen.conf /etc/apache2/sites-available/nextgen.conf
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2ensite nextgen.conf
sudo systemctl restart apache2
sudo pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
"@

ssh -i "$sshKey" -o StrictHostKeyChecking=no "${user}@${serverIp}" "$remoteCommands"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to execute server commands."
    exit
}

Write-Host "Deployment completed successfully! Apache reverse proxy is active." -ForegroundColor Green
Write-Host "Please make sure you have mapped your domain 'nextgeninnovations.com.np' to $serverIp in your DNS settings." -ForegroundColor Yellow
