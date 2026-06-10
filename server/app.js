const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Initialize Firebase Admin (Project ID is sufficient for ID token verification)
try {
    initializeApp({ projectId: 'next-gen-worldcup2026' });
} catch (e) {
    console.error("Firebase Admin initialization error:", e);
}

const app = express();
const PORT = process.env.PORT || 3001;

// ─── DATABASE ─────────────────────────────────────────────────────────────────
const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 5432,
    database: process.env.DB_NAME     || 'next_gen_db',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
    origin: [
        'http://localhost:5500', 'http://localhost:5501',
        'http://127.0.0.1:5500', 'http://127.0.0.1:5501',
        'http://localhost:3001'
    ]
}));
app.use(bodyParser.json({ limit: '50mb' })); // large enough for multiple base64 images

// Serve the whole project as static files
app.use(express.static(path.join(__dirname, '../')));

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const checkAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const [username, password] = Buffer.from(token, 'base64').toString().split(':');

    try {
        const result = await pool.query(
            'SELECT 1 FROM admin_auth WHERE (username = $1 OR email = $1) AND password_hash = $2',
            [username, password]
        );
        if (result.rows.length > 0) next();
        else res.status(401).json({ error: 'Invalid credentials' });
    } catch (err) {
        res.status(500).json({ error: 'Auth failed' });
    }
};

// ─── FOUNDERS ─────────────────────────────────────────────────────────────────
app.get('/api/founders', async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM founders ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/founders', checkAuth, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('TRUNCATE founders RESTART IDENTITY');
        for (const f of req.body) {
            await client.query(
                'INSERT INTO founders (name, role, avatar, bio, education, color, tag, image_data) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
                [f.name, f.role, f.avatar, f.bio, f.education || '', f.color, f.tag || '', f.imageData || '']
            );
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
});

// ─── NOTICES ──────────────────────────────────────────────────────────────────
app.get('/api/notices', async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notices LIMIT 1');
        res.json(result.rows[0] || { active: false, message: '', type: 'info', link: '' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/notices', checkAuth, async (req, res) => {
    try {
        const n = req.body;
        await pool.query('TRUNCATE notices RESTART IDENTITY');
        await pool.query(
            'INSERT INTO notices (active, message, type, link) VALUES ($1,$2,$3,$4)',
            [n.active, n.message, n.type, n.link || null]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── TERMS ────────────────────────────────────────────────────────────────────
app.get('/api/terms', async (_req, res) => {
    try {
        const termRes = await pool.query('SELECT * FROM terms ORDER BY id DESC LIMIT 1');
        if (termRes.rows.length === 0) return res.json({ title: '', sections: [] });

        const termId = termRes.rows[0].id;
        const secRes = await pool.query(
            'SELECT * FROM term_sections WHERE term_id = $1 ORDER BY "order" ASC',
            [termId]
        );
        res.json({ title: termRes.rows[0].title, lastUpdated: termRes.rows[0].last_updated, sections: secRes.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/terms', checkAuth, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const termRes = await client.query(
            'INSERT INTO terms (title, last_updated) VALUES ($1, NOW()) RETURNING id',
            [req.body.title || 'Terms & Conditions']
        );
        const termId = termRes.rows[0].id;
        for (let i = 0; i < req.body.sections.length; i++) {
            const sec = req.body.sections[i];
            await client.query(
                'INSERT INTO term_sections (term_id, heading, content, "order") VALUES ($1,$2,$3,$4)',
                [termId, sec.heading, sec.content, i]
            );
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
});

// ─── CAREERS ──────────────────────────────────────────────────────────────────
app.get('/api/careers', async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM careers ORDER BY id ASC');
        const rows = result.rows.map(r => ({
            ...r,
            requirements: typeof r.requirements === 'string' ? JSON.parse(r.requirements) : r.requirements
        }));
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/careers', checkAuth, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('TRUNCATE careers RESTART IDENTITY');
        for (const c of req.body) {
            await client.query(
                'INSERT INTO careers (title, department, location, type, description, requirements, status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
                [c.title, c.department, c.location, c.type, c.description, JSON.stringify(c.requirements || []), c.status || 'open']
            );
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
});

// ─── HERO BANNERS ─────────────────────────────────────────────────────────────
// Public: active banners only
app.get('/api/heroBanners', async (_req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM hero_banners WHERE active = true ORDER BY sort_order ASC'
        );
        res.json({ banners: result.rows.map(mapBanner) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: all banners including inactive
app.get('/api/heroBanners/all', checkAuth, async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM hero_banners ORDER BY sort_order ASC');
        res.json({ banners: result.rows.map(mapBanner) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Save banners (full replace)
app.post('/api/heroBanners', checkAuth, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('TRUNCATE hero_banners RESTART IDENTITY');
        const banners = req.body.banners || [];
        for (let i = 0; i < banners.length; i++) {
            const b = banners[i];
            await client.query(
                `INSERT INTO hero_banners (title, tag, subtitle, cta_text, cta_link, image_data, active, sort_order)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                [b.title || '', b.tag || '', b.subtitle || '', b.ctaText || '', b.ctaLink || '',
                 b.imageData || '', b.active !== false, i]
            );
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
});

function mapBanner(r) {
    return {
        id:        r.id,
        title:     r.title,
        tag:       r.tag,
        subtitle:  r.subtitle,
        ctaText:   r.cta_text,
        ctaLink:   r.cta_link,
        imageData: r.image_data,
        active:    r.active,
        sortOrder: r.sort_order
    };
}

// ─── CONTACT QUERIES ──────────────────────────────────────────────────────────
// Public: submit query
app.post('/api/queries', async (req, res) => {
    try {
        const q = req.body;
        await pool.query(
            `INSERT INTO queries (first_name, last_name, email, phone, service, message)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [q.firstName || '', q.lastName || '', q.email || '', q.phone || '', q.service || '', q.message || '']
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: get all queries
app.get('/api/queries', checkAuth, async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM queries ORDER BY created_at DESC');
        res.json(result.rows.map(r => ({
            id:        r.id,
            firstName: r.first_name,
            lastName:  r.last_name,
            email:     r.email,
            phone:     r.phone,
            service:   r.service,
            message:   r.message,
            read:      r.read,
            status:    r.status,
            timestamp: r.created_at
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: mark as read / update status
app.patch('/api/queries/:id', checkAuth, async (req, res) => {
    try {
        const { read, status } = req.body;
        await pool.query(
            'UPDATE queries SET read = $1, status = $2 WHERE id = $3',
            [read !== undefined ? read : true, status || 'read', req.params.id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: delete query
app.delete('/api/queries/:id', checkAuth, async (req, res) => {
    try {
        await pool.query('DELETE FROM queries WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── WORLD CUP MODULE ─────────────────────────────────────────────────────────
async function initDBs() {
    try {
        // Ensure email column exists in admin_auth
        await pool.query(`
            ALTER TABLE admin_auth ADD COLUMN IF NOT EXISTS email VARCHAR(255);
        `);

        // World Cup Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS worldcup_users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE,
                firebase_uid VARCHAR(255) UNIQUE,
                points INT DEFAULT 0,
                notifications_enabled BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS worldcup_predictions (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES worldcup_users(id),
                match_id VARCHAR(50) NOT NULL,
                score_a INT NOT NULL,
                score_b INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, match_id)
            );
        `);
    } catch(err) {
        console.error("Failed to init DBs:", err.message);
    }
}
initDBs();

// --- SECURE WORLD CUP ROUTES ---
app.post('/api/worldcup/login', async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ error: 'No token provided' });
        
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const { uid, email, name } = decodedToken;
        
        // Upsert user into database
        const result = await pool.query(`
            INSERT INTO worldcup_users (firebase_uid, email, name)
            VALUES ($1, $2, $3)
            ON CONFLICT (firebase_uid) 
            DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email
            RETURNING points
        `, [uid, email, name || 'Predictor']);
        
        res.json({ success: true, points: result.rows[0].points });
    } catch (err) {
        console.error("Firebase Auth Error:", err.message);
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.post('/api/worldcup/predict', async (req, res) => {
    try {
        const { idToken, matchId, scoreA, scoreB } = req.body;
        if (!idToken || !matchId) return res.status(400).json({ error: 'Missing data' });
        
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        // Get user ID
        const userRes = await pool.query('SELECT id FROM worldcup_users WHERE firebase_uid = $1', [uid]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const userId = userRes.rows[0].id;
        
        // Upsert prediction
        await pool.query(`
            INSERT INTO worldcup_predictions (user_id, match_id, score_a, score_b)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, match_id)
            DO UPDATE SET score_a = EXCLUDED.score_a, score_b = EXCLUDED.score_b
        `, [userId, matchId, scoreA, scoreB]);
        
        res.json({ success: true });
    } catch (err) {
        console.error("Prediction Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/worldcup/users', async (req, res) => {
    try {
        const { name, email, notificationsEnabled } = req.body;
        // Upsert based on email
        await pool.query(
            `INSERT INTO worldcup_users (name, email, notifications_enabled) 
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO UPDATE SET notifications_enabled = EXCLUDED.notifications_enabled`,
            [name, email || (name + Math.random().toString(36).substring(7) + '@example.com'), notificationsEnabled]
        );
        res.json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/worldcup/users', checkAuth, async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM worldcup_users ORDER BY points DESC, created_at DESC');
        res.json(result.rows);
    } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/worldcup/leaderboard', async (_req, res) => {
    try {
        const result = await pool.query('SELECT name, points FROM worldcup_users ORDER BY points DESC LIMIT 50');
        res.json(result.rows);
    } catch(err) { res.status(500).json({ error: err.message }); }
});

// ─── EMAIL TRANSPORT CONFIG (ZOHO MAIL) ──────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'info@nextgeninnovations.com.np',
        pass: process.env.EMAIL_PASS || 'your_zoho_app_password_here'
    }
});

// ─── AUTOMATED 12 PM SPIN & WINNER SELECTION ─────────────────────────────────
// Runs every day exactly at 12:00 PM (Server Time)
cron.schedule('0 12 * * *', async () => {
    console.log("🕛 [CRON] Triggering Daily 12 PM Winner Spin...");
    try {
        // Here you would join your predictions table. 
        // For now, we pick a random user who has points > 0 (as an example of an exact scorer)
        const result = await pool.query('SELECT * FROM worldcup_users WHERE points > 0 ORDER BY RANDOM() LIMIT 1');
        
        if(result.rows.length > 0) {
            const winner = result.rows[0];
            console.log(`🏆 [CRON] Winner selected: ${winner.name} (${winner.email})`);
            
            // Send Congratulatory Email
            if (winner.email && winner.email.includes('@')) {
                const mailOptions = {
                    from: '"Next Gen Innovations" <info@nextgeninnovations.com.np>',
                    to: winner.email,
                    subject: '🎉 Congratulations! You won the Daily Spin - Next Gen Craze Fest 2026',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
                            <h2 style="color: #10b981;">🎉 You are the Daily Winner!</h2>
                            <p>Hi <b>${winner.name}</b>,</p>
                            <p>Your exact-score prediction was spot on, and the Spin Wheel has selected YOU as yesterday's lucky winner!</p>
                            <p>You have won a <b>100 NPR Daily Recharge</b>.</p>
                            <p>Please reply to this email with your mobile number to claim your prize.</p>
                            <br>
                            <p>Keep playing the <a href="https://nextgeninnovations.com.np/worldcup.html">Predictor Arena</a> to climb the leaderboard and win a Smartwatch!</p>
                            <p style="color: #6b7280; font-size: 0.9em;">- Team Next Gen Innovations</p>
                        </div>
                    `
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) console.error("❌ [CRON] Error sending email:", error);
                    else console.log("✅ [CRON] Winner email sent: " + info.response);
                });
            }
        } else {
            console.log("⚠️ [CRON] No eligible exact scorers found for today.");
        }
    } catch(err) {
        console.error("❌ [CRON] Spin failed:", err);
    }
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin/index.html`);
});
