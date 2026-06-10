const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_PASS = process.env.DB_PASSWORD; // User's password from env
const DB_NAME = 'next_gen_db';

async function init() {
    // 1. Create Database if not exists
    const adminClient = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || DB_PASS,
    });

    try {
        await adminClient.connect();
        const res = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
        if (res.rowCount === 0) {
            console.log(`Creating database "${DB_NAME}"...`);
            await adminClient.query(`CREATE DATABASE ${DB_NAME}`);
        }
        await adminClient.end();

        // 2. Run Schema & Seed
        const client = new Client({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: DB_NAME,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || DB_PASS,
        });

        await client.connect();
        console.log(`Connected to "${DB_NAME}". Initializing tables...`);

        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await client.query(schemaSql);
        console.log('Tables created.');

        // 3. Add education column if not present (schema updated already? let's be safe)
        try {
            await client.query('ALTER TABLE founders ADD COLUMN education TEXT;');
            console.log('Added education column.');
        } catch (e) {
            // Might already exist if schema.sql was updated
        }

        // 4. Seed Data
        console.log('Seeding data...');
        const founders = [
            { name: "Yubraj Paswan", role: "Founder", education: "Diploma in Agriculture from CTEVT", avatar: "YP", bio: "Visionary leader driving strategic growth and digital inclusion in Nepal.", color: "linear-gradient(135deg, #0F1C3F, #1A348A)", tag: "Founder" },
            { name: "Abhishek Kumar Paswan", role: "Senior Developer & Business Lead", education: "BBS from Tribhubhan University, pursuing MBA from NOU", avatar: "AP", bio: "Expert developer specializing in scalable enterprise software and technology leadership.", color: "linear-gradient(135deg, #1A348A, #2a4bc4)", tag: "Tech Lead" },
            { name: "Payal Paswan", role: "Business Development Head", education: "Management Professional", avatar: "PP", bio: "Leading strategic relations, brand representation, and company growth initiatives.", color: "linear-gradient(135deg, #00C9B1, #00e5cf)", tag: "Management" },
            { name: "Bidur Paswan", role: "Developer", education: "SLC from Pashupati MA Vi Lahan, pursuing +2 from NEB", avatar: "BP", bio: "Passionate developer focused on modern web technologies and frontend engineering.", color: "linear-gradient(135deg, #4f46e5, #00C9B1)", tag: "Developer" },
            { name: "Basu Paswan", role: "Developer", education: "Class 2", avatar: "BP", bio: "Enthusiastic developer learning new frameworks and building robust services.", color: "linear-gradient(135deg, #6366f1, #a855f7)", tag: "Developer" },
            { name: "Barsha Paswan", role: "Business Analyst", education: "BBS", avatar: "BP", bio: "Business analyst analyzing client requirements, systems workflow, and project design.", color: "linear-gradient(135deg, #ec4899, #f43f5e)", tag: "Analysis" }
        ];

        await client.query('TRUNCATE founders RESTART IDENTITY');
        for (const f of founders) {
            await client.query(
                'INSERT INTO founders (name, role, education, avatar, bio, color, tag) VALUES ($1,$2,$3,$4,$5,$6,$7)',
                [f.name, f.role, f.education, f.avatar, f.bio, f.color, f.tag]
            );
        }
        
        console.log('Full initialization completed successfully!');
        await client.end();
    } catch (err) {
        console.error('Initialization failed:', err);
    }
}

init();
