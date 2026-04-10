const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DATA_DIR = path.join(__dirname, '../data');

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'next_gen_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

const readData = (filename) => {
    try {
        const filePath = path.join(DATA_DIR, `${filename}.json`);
        if (!fs.existsSync(filePath)) return null;
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        console.error(`Error reading ${filename}.json:`, err);
        return null;
    }
};

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database.');

        // 1. Migrate Founders
        const founders = readData('founders');
        if (founders) {
            console.log(`Migrating ${founders.length} founders...`);
            for (const f of founders) {
                await client.query(
                    'INSERT INTO founders (name, role, avatar, bio, color, tag) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
                    [f.name, f.role, f.avatar, f.bio, f.color, f.tag || '']
                );
            }
        }

        // 2. Migrate Notices
        const notices = readData('notices');
        if (notices) {
            console.log('Migrating notice...', notices);
            // notices is an object in old format
            const active = notices.active !== undefined ? notices.active : true;
            await client.query(
                'INSERT INTO notices (active, message, type, link) VALUES ($1, $2, $3, $4)',
                [active, notices.message || '', notices.type || 'info', notices.link || null]
            );
        }

        // 3. Migrate Terms and Sections
        const termsObj = readData('terms');
        if (termsObj && termsObj.sections) {
            console.log('Migrating terms and sections...');
            const termRes = await client.query(
                'INSERT INTO terms (title, last_updated) VALUES ($1, $2) RETURNING id',
                [termsObj.title || 'Terms & Conditions', termsObj.lastUpdated || new Date()]
            );
            const termId = termRes.rows[0].id;

            for (let i = 0; i < termsObj.sections.length; i++) {
                const sec = termsObj.sections[i];
                await client.query(
                    'INSERT INTO term_sections (term_id, heading, content, "order") VALUES ($1, $2, $3, $4)',
                    [termId, sec.heading, sec.content, i]
                );
            }
        }

        // 4. Migrate Careers
        const careers = readData('careers');
        if (careers) {
            console.log(`Migrating ${careers.length} careers...`);
            for (const c of careers) {
                await client.query(
                    'INSERT INTO careers (title, department, location, type, description, requirements, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [c.title, c.department, c.location, c.type, c.description, JSON.stringify(c.requirements || []), c.status || 'open']
                );
            }
        }

        // 5. Default Admin User
        console.log('Creating default admin user...');
        const username = process.env.ADMIN_USERNAME || 'admin';
        // In reality, this should be bcrpyt hashed. For this mock, we just use plain or simple btoa if matching old auth. 
        // We'll store it as plain text right now since the checkAuth uses plain text comparison in the new/old app.js if not hashed.
        const passwordPlain = process.env.ADMIN_PASSWORD || 'admin';
        await client.query(
            "INSERT INTO admin_auth (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash",
            [username, passwordPlain]
        );

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
