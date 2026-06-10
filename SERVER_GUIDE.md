# Server Management Guide

This guide contains the instructions to connect to your Oracle Cloud instance and basic commands for managing your deployed project.

## How to SSH into the Server

You can connect to your server from your local Windows machine using the SSH key you provided. 

Open **PowerShell** or **Command Prompt** and run the following command:

```bash
ssh -i "E:\Next-Gen-Innovations-Nepal-Private-Limited\SSH Creditt\SSH Creditt\ssh-key-2026-05-27.key" ubuntu@161.118.189.212
```

> [!NOTE]
> If you get a "Permission denied (publickey)" error, it means Windows permissions for the key file are too open. To fix this, you must restrict the file permissions so only your user has access to it.

---

## Important Commands (Once Setup is Complete)

Once the Node.js application is deployed, you will use these commands to manage it.

### 1. View Application Logs
To see the live console output (errors, logs) of your backend:
```bash
pm2 logs next-gen-app
```

### 2. Restart the Application
If you make code changes directly on the server, you need to restart the app:
```bash
pm2 restart next-gen-app
```

### 3. Check Status
To see if the application is online or has crashed:
```bash
pm2 status
```

### 4. Restart Apache (Reverse Proxy)
If you change domain settings or SSL certificates:
```bash
sudo systemctl restart apache2
```

---

## Database Management (PostgreSQL)

To connect to the database command line:
```bash
sudo -u postgres psql
```
Once inside `psql`, you can connect to your database:
```sql
\c next_gen_db
```
