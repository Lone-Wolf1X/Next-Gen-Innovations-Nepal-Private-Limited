const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 5432,
    database: process.env.DB_NAME     || 'next_gen_db',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function seedAdmin() {
    const username = 'admin';
    const password = 'password123'; // Change this!

    try {
        console.log('Seeding admin account...');
        
        // Ensure table exists (though it should be created by schema.sql)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admin_auth (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        `);

        // Check if admin already exists
        const checkResult = await pool.query('SELECT 1 FROM admin_auth WHERE username = $1', [username]);
        
        if (checkResult.rows.length > 0) {
            console.log(`Admin user "${username}" already exists. Updating password...`);
            await pool.query('UPDATE admin_auth SET password_hash = $1 WHERE username = $2', [password, username]);
        } else {
            console.log(`Creating admin user "${username}"...`);
            await pool.query('INSERT INTO admin_auth (username, password_hash) VALUES ($1, $2)', [username, password]);
        }

        console.log('✅ Admin seeding successful!');
        console.log('Username: ' + username);
        console.log('Password: ' + password);
        console.log('IMPORTANT: Please change this password after logging in.');
    } catch (err) {
        console.error('❌ Error seeding admin:', err.message);
    } finally {
        await pool.end();
    }
}

seedAdmin();
