const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'next_gen_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function fix() {
    try {
        await client.connect();
        console.log('Connected to database.');
        
        console.log('Adding missing columns to "founders" table...');
        // Add education column if missing
        await client.query('ALTER TABLE founders ADD COLUMN IF NOT EXISTS education TEXT;');
        // Add image_data column if missing
        await client.query('ALTER TABLE founders ADD COLUMN IF NOT EXISTS image_data TEXT;');
        
        console.log('✅ Database columns fixed successfully!');
    } catch (err) {
        console.error('❌ Fix failed:', err.message);
    } finally {
        await client.end();
    }
}

fix();
