#!/bin/bash
KEY="/Users/abhisekpaswan/Downloads/Next Gen/Next-Gen-Innovations-Nepal-Private-Limited/SSH Creditt/ssh-key-2026-05-27.key"
REMOTE="ubuntu@161.118.189.212"
REMOTE_DIR="/var/www/nextgen"

echo "Creating tar archive..."
tar -czvf update.tar.gz learn/admin/ learn/backend/api/ learn/backend/schema.sql

echo "Uploading tar archive..."
scp -i "$KEY" -o StrictHostKeyChecking=no update.tar.gz "$REMOTE":/tmp/update.tar.gz

echo "Extracting and applying database changes on remote server..."
ssh -i "$KEY" -o StrictHostKeyChecking=no "$REMOTE" "cd '$REMOTE_DIR' && sudo tar -xzvf /tmp/update.tar.gz && sudo chown -R ubuntu:ubuntu learn/ && sudo chmod -R 755 learn/ && mysql -u root -p'Admin@9876@' next_gen_db < learn/backend/schema.sql"

echo "Done!"
