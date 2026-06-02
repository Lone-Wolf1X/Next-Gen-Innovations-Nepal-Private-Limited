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
        name: "Yubraj Paswan",
        role: "Founder",
        education: "Diploma in Agriculture from CTEVT",
        avatar: "YP",
        bio: "Visionary leader driving strategic growth and digital inclusion in Nepal.",
        color: "linear-gradient(135deg, #0F1C3F, #1A348A)",
        tag: "Founder"
    },
    {
        name: "Abhishek Kumar Paswan",
        role: "Senior Developer & Business Lead",
        education: "BBS from Tribhubhan University, pursuing MBA from NOU",
        avatar: "AP",
        bio: "Expert developer specializing in scalable enterprise software and technology leadership.",
        color: "linear-gradient(135deg, #1A348A, #2a4bc4)",
        tag: "Tech Lead"
    },
    {
        name: "Payal Paswan",
        role: "Business Development Head",
        education: "Management Professional",
        avatar: "PP",
        bio: "Leading strategic relations, brand representation, and company growth initiatives.",
        color: "linear-gradient(135deg, #00C9B1, #00e5cf)",
        tag: "Management"
    },
    {
        name: "Bidur Paswan",
        role: "Developer",
        education: "SLC from Pashupati MA Vi Lahan, pursuing +2 from NEB",
        avatar: "BP",
        bio: "Passionate developer focused on modern web technologies and frontend engineering.",
        color: "linear-gradient(135deg, #4f46e5, #00C9B1)",
        tag: "Developer"
    },
    {
        name: "Basu Paswan",
        role: "Developer",
        education: "Class 2",
        avatar: "BP",
        bio: "Enthusiastic developer learning new frameworks and building robust services.",
        color: "linear-gradient(135deg, #6366f1, #a855f7)",
        tag: "Developer"
    },
    {
        name: "Barsha Paswan",
        role: "Business Analyst",
        education: "BBS",
        avatar: "BP",
        bio: "Business analyst analyzing client requirements, systems workflow, and project design.",
        color: "linear-gradient(135deg, #ec4899, #f43f5e)",
        tag: "Analysis"
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
