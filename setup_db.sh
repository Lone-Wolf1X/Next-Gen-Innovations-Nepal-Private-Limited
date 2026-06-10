sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE DATABASE next_gen_db;"
sudo -u postgres psql -c "CREATE USER next_gen_user WITH ENCRYPTED PASSWORD 'NextGen123!@#';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE next_gen_db TO next_gen_user;"
