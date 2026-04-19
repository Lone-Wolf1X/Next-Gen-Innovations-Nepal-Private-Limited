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

const founders = [
    {
        name: "Yubaraj Paswan",
        role: "Director/Shareholder",
        education: "Diploma in Agriculture from CTEVT",
        avatar: "YP",
        bio: "Visionary leader with a background in agricultural innovation, steering the company's strategic growth.",
        color: "linear-gradient(135deg, #0F1C3F, #1A348A)",
        tag: "Founder"
    },
    {
        name: "Abhishek Kumar Paswan",
        role: "Senior Developer",
        education: "BBS from Tribhubhan University, pursuing MBA from Nepal Open University",
        avatar: "AP",
        bio: "Expert developer specializing in scalable enterprise solutions and FinTech platforms.",
        color: "linear-gradient(135deg, #1A348A, #2a4bc4)",
        tag: "Tech Lead"
    },
    {
        name: "Payal Kumari Paswan",
        role: "CFO/CEO & Brand Ambassador",
        education: "Management Professional",
        avatar: "PP",
        bio: "Leading the company's financial operations and brand presence with a focus on sustainable growth.",
        color: "linear-gradient(135deg, #00C9B1, #00e5cf)",
        tag: "Management"
    },
    {
        name: "Bidur Paswan",
        role: "Junior Developer",
        education: "SLC from Pashupati MA Vi Lahan, pursuing +2 from NEB",
        avatar: "BP",
        bio: "Passionate developer focused on modern web technologies and frontend excellence.",
        color: "linear-gradient(135deg, #4f46e5, #00C9B1)",
        tag: "Developer"
    },
    {
        name: "Basu Paswan",
        role: "Junior Developer",
        education: "Class 2",
        avatar: "BP",
        bio: "Enthusiastic junior developer learning and contributing to the Next Gen tech stack.",
        color: "linear-gradient(135deg, #6366f1, #a855f7)",
        tag: "Developer"
    }
];

async function seed() {
    try {
        await client.connect();
        console.log('Connected to database.');

        console.log('Clearing existing founders...');
        await client.query('TRUNCATE founders RESTART IDENTITY');

        console.log('Seeding founders data...');
        for (const f of founders) {
            await client.query(
                'INSERT INTO founders (name, role, education, avatar, bio, color, tag) VALUES ($1,$2,$3,$4,$5,$6,$7)',
                [f.name, f.role, f.education, f.avatar, f.bio, f.color, f.tag]
            );
        }

        console.log('Seeding completed successfully!');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.end();
    }
}

seed();
