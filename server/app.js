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

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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
app.use(bodyParser.json({ limit: '50mb' }));

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
        let secOrder = 0;
        for (const sec of req.body.sections) {
            await client.query(
                'INSERT INTO term_sections (term_id, heading, content, "order") VALUES ($1,$2,$3,$4)',
                [termId, sec.heading, sec.content, secOrder]
            );
            secOrder++;
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
app.get('/api/heroBanners', async (_req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM hero_banners WHERE active = true ORDER BY sort_order ASC'
        );
        res.json({ banners: result.rows.map(mapBanner) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/heroBanners/all', checkAuth, async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM hero_banners ORDER BY sort_order ASC');
        res.json({ banners: result.rows.map(mapBanner) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/heroBanners', checkAuth, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('TRUNCATE hero_banners RESTART IDENTITY');
        const banners = req.body.banners || [];
        let sortOrder = 0;
        for (const b of banners) {
            await client.query(
                `INSERT INTO hero_banners (title, tag, subtitle, cta_text, cta_link, image_data, active, sort_order)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                [b.title || '', b.tag || '', b.subtitle || '', b.ctaText || '', b.ctaLink || '',
                 b.imageData || '', b.active !== false, sortOrder]
            );
            sortOrder++;
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

app.delete('/api/queries/:id', checkAuth, async (req, res) => {
    try {
        await pool.query('DELETE FROM queries WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── WORLD CUP MODULE ─────────────────────────────────────────────────────────
async function initDBs() {
    try {
        await pool.query(`
            ALTER TABLE admin_auth ADD COLUMN IF NOT EXISTS email VARCHAR(255);
        `);
    } catch(err) {
        console.warn("Skipping admin_auth alter (may lack permissions):", err.message);
    }
    
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS worldcup_users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE,
                firebase_uid VARCHAR(255) UNIQUE,
                points INT DEFAULT 0,
                last_checkin TIMESTAMP,
                country VARCHAR(100) DEFAULT 'Nepal',
                notifications_enabled BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await pool.query(`
            ALTER TABLE worldcup_users ADD COLUMN IF NOT EXISTS last_checkin TIMESTAMP;
        `);
        await pool.query(`
            ALTER TABLE worldcup_users ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Nepal';
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

        await pool.query(`
            CREATE TABLE IF NOT EXISTS worldcup_referrals (
                id SERIAL PRIMARY KEY,
                referrer_id INT REFERENCES worldcup_users(id),
                referred_id INT REFERENCES worldcup_users(id) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS worldcup_spin_winners (
                id SERIAL PRIMARY KEY,
                draw_date DATE DEFAULT CURRENT_DATE UNIQUE,
                match_id VARCHAR(50),
                match_name VARCHAR(255),
                prize_unlocked VARCHAR(100),
                predictors_count INT,
                correct_predictors_json TEXT,
                winner_name VARCHAR(255),
                winner_email VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    } catch(err) {
        console.error("Failed to init DBs:", err.message);
    }
}
initDBs();

// ─── EMAIL TRANSPORT CONFIG (ZOHO MAIL) ──────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || 'info@nextgeninnovations.com.np',
        pass: process.env.EMAIL_PASS || 'your_zoho_app_password_here'
    }
});

// Helper function to run the daily draw automatically based on actual scores
async function runWorldCupDraw() {
    console.log("🕛 [DRAW] Starting Live 12 PM Draw & Match Resolution...");
    try {
        // Fetch teams first to map names
        const teamsResponse = await fetch('https://worldcup26.ir/get/teams');
        const teamsData = await teamsResponse.json();
        const teamsMap = {};
        if (teamsData && teamsData.teams) {
            teamsData.teams.forEach(t => {
                teamsMap[t.id] = t;
            });
        }

        const response = await fetch('https://worldcup26.ir/get/games');
        const data = await response.json();
        
        if (!data || !data.games || data.games.length === 0) {
            console.log("⚠️ [DRAW] No matches found on games API today.");
            return;
        }

        for (const e of data.games) {
            const isCompleted = (e.finished === "TRUE" || e.time_elapsed === "finished");
            if (isCompleted) {
                const matchId = String(e.id);
                const teamA = teamsMap[e.home_team_id];
                const teamB = teamsMap[e.away_team_id];
                const nameA = teamA ? teamA.name_en : (e.home_team_name_en || e.home_team_label || 'TBD');
                const nameB = teamB ? teamB.name_en : (e.away_team_name_en || e.away_team_label || 'TBD');
                const scoreA = parseInt(e.home_score, 10);
                const scoreB = parseInt(e.away_score, 10);
                const matchName = `${nameA} vs ${nameB}`;

                console.log(`⚽ [DRAW] Match Completed: ${matchName} (Official score: ${scoreA} - ${scoreB})`);

                const checkDraw = await pool.query('SELECT 1 FROM worldcup_spin_winners WHERE match_id = $1', [matchId]);
                if (checkDraw.rows.length > 0) {
                    console.log(`⚠️ [DRAW] Match ${matchId} already drawn previously.`);
                    continue;
                }

                // 1. Get all predictions for this match
                const predRes = await pool.query('SELECT COUNT(*) as count FROM worldcup_predictions WHERE match_id = $1', [matchId]);
                const totalPredictors = parseInt(predRes.rows[0].count, 10);

                // Determine active prize pool tier
                let prize = "Rs. 50 Recharge";
                if (totalPredictors >= 1000) {
                    prize = "Grand Gift Hamper (World Cup T-Shirt Set & Smartwatch)";
                } else if (totalPredictors >= 500) {
                    prize = "Rs. 500 Recharge";
                } else if (totalPredictors >= 100) {
                    prize = "Rs. 100 Recharge";
                }

                // 2. Find correct predictions (exact score)
                const correctRes = await pool.query(`
                    SELECT u.id, u.name, u.email, u.country 
                    FROM worldcup_predictions p 
                    JOIN worldcup_users u ON p.user_id = u.id 
                    WHERE p.match_id = $1 AND p.score_a = $2 AND p.score_b = $3
                `, [matchId, scoreA, scoreB]);

                const correctPredictors = correctRes.rows;

                if (correctPredictors.length === 0) {
                    console.log(`⚠️ [DRAW] No correct predictors for ${matchName}.`);
                    await pool.query(`
                        INSERT INTO worldcup_spin_winners (match_id, match_name, prize_unlocked, predictors_count, correct_predictors_json, winner_name, winner_email)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [matchId, matchName, prize, totalPredictors, '[]', 'No Winner', '']);
                    continue;
                }

                // 3. Award points to ALL correct predictors (+100 points reward!)
                for (const u of correctPredictors) {
                    await pool.query('UPDATE worldcup_users SET points = points + 100 WHERE id = $1', [u.id]);
                }

                // 4. Select a random lucky draw winner
                const randomIndex = Math.floor(Math.random() * correctPredictors.length);
                const winner = correctPredictors[randomIndex];
                const correctNamesJson = JSON.stringify(correctPredictors.map(c => c.name));

                // If winner is international, adjust the spin wheel text/prize to indicate Nepal Jersey entry
                let finalPrize = prize;
                if (winner.country !== 'Nepal') {
                    finalPrize = "Nepal National Team Jersey Draw Entry";
                }

                // 5. Save draw to database
                await pool.query(`
                    INSERT INTO worldcup_spin_winners (match_id, match_name, prize_unlocked, predictors_count, correct_predictors_json, winner_name, winner_email)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [matchId, matchName, finalPrize, totalPredictors, correctNamesJson, winner.name, winner.email]);

                console.log(`🎉 [DRAW] Lucky Winner Selected: ${winner.name} (${winner.email})! Prize: ${finalPrize}`);

                // 6. Send Congratulatory Email to the winner
                if (winner.email && winner.email.includes('@')) {
                    const mailOptions = {
                        from: '"Next Gen Innovations" <info@nextgeninnovations.com.np>',
                        to: winner.email,
                        subject: `🎉 Congratulations! You won the Daily Spin Draw - Next Gen Craze Fest 2026`,
                        html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px; background-color: #f9fafb;">\n' +
                              '    <h2 style="color: #10b981; text-align: center;">🎉 You are the Daily Draw Winner!</h2>\n' +
                              '    <p>Hi <b>' + escapeHtml(winner.name) + '</b>,</p>\n' +
                              '    <p>Your exact-score prediction for <b>' + escapeHtml(matchName) + '</b> (Score: ' + scoreA + '-' + scoreB + ') was correct, and you have been drawn as the **Lucky Daily Winner**!</p>\n' +
                              '    <p>🏆 <b>Your Prize:</b> ' + escapeHtml(finalPrize) + '</p>\n' +
                              '    <p>Please reply to this email with your contact / delivery details to claim your prize.</p>\n' +
                              '    <br>\n' +
                              '    <p>Keep playing the <a href="https://nextgeninnovations.com.np/worldcup.html">Predictor Arena</a> to climb the leaderboard!</p>\n' +
                              '    <p style="color: #6b7280; font-size: 0.9em;">- Team Next Gen Innovations</p>\n' +
                              '</div>'
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) console.error("❌ [DRAW] Error sending email:", error);
                        else console.log("✅ [DRAW] Winner email sent: " + info.response);
                    });
                }
            }
        }
    } catch(err) {
        console.error("❌ [DRAW] Auto-resolve / draw error:", err);
    }
}

// --- SECURE WORLD CUP ROUTES ---
app.post('/api/worldcup/login', async (req, res) => {
    try {
        const { idToken, referrerUid, country: reqCountry } = req.body;
        if (!idToken) return res.status(400).json({ error: 'No token provided' });
        
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const { uid, email, name } = decodedToken;
        
        // Check if user exists first
        const userCheck = await pool.query('SELECT id, points, last_checkin, country FROM worldcup_users WHERE firebase_uid = $1', [uid]);
        const isNewUser = (userCheck.rows.length === 0);
        let userPoints = 0;
        let lastCheckin = null;
        let country = reqCountry || 'Nepal';
        let userId = null;

        if (isNewUser) {
            let initialPoints = 0;
            let referrerId = null;

            if (referrerUid && referrerUid !== uid) {
                const refCheck = await pool.query('SELECT id FROM worldcup_users WHERE firebase_uid = $1', [referrerUid]);
                if (refCheck.rows.length > 0) {
                    referrerId = refCheck.rows[0].id;
                    initialPoints = 10; // New referred user gets 10 points
                }
            }

            // Insert new user
            const insertRes = await pool.query(`
                INSERT INTO worldcup_users (firebase_uid, email, name, points, country)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, points, last_checkin, country
            `, [uid, email, name || 'Predictor', initialPoints, country]);
            
            userId = insertRes.rows[0].id;
            userPoints = insertRes.rows[0].points;
            lastCheckin = insertRes.rows[0].last_checkin;
            country = insertRes.rows[0].country;

            // Log referral and award +10 points to referrer
            if (referrerId) {
                try {
                    await pool.query(`
                        INSERT INTO worldcup_referrals (referrer_id, referred_id)
                        VALUES ($1, $2)
                    `, [referrerId, userId]);

                    await pool.query(`
                        UPDATE worldcup_users
                        SET points = points + 10
                        WHERE id = $1
                    `, [referrerId]);
                    console.log(`Referral credited: user ${userId} referred by ${referrerId}`);
                } catch (refErr) {
                    console.error("Referral logging error (likely duplicate referred_id):", refErr.message);
                }
            }
        } else {
            const updateRes = await pool.query(`
                UPDATE worldcup_users
                SET name = $1, email = $2
                WHERE firebase_uid = $3
                RETURNING id, points, last_checkin, country
            `, [name || 'Predictor', email, uid]);

            userId = updateRes.rows[0].id;
            userPoints = updateRes.rows[0].points;
            lastCheckin = updateRes.rows[0].last_checkin;
            country = updateRes.rows[0].country;
        }

        // Check Nepal Time check-in status
        const getNepalLocalDateStr = (dateObj) => {
            if (!dateObj) return null;
            const nepalTime = new Date(dateObj.getTime() + (5.75 * 3600 * 1000));
            return nepalTime.toISOString().slice(0, 10);
        };
        const todayNepalStr = getNepalLocalDateStr(new Date());
        const lastCheckinNepalStr = lastCheckin ? getNepalLocalDateStr(new Date(lastCheckin)) : null;
        const checkedInToday = (lastCheckinNepalStr === todayNepalStr);
        
        res.json({ success: true, points: userPoints, checkedInToday, country });
    } catch (err) {
        console.error("Firebase Auth Error:", err.message);
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.post('/api/worldcup/user/update', async (req, res) => {
    try {
        const { idToken, country, notificationsEnabled } = req.body;
        if (!idToken || !country) return res.status(400).json({ error: 'Missing parameter' });

        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        let query = `
            UPDATE worldcup_users
            SET country = $1
        `;
        let params = [country, uid];

        if (notificationsEnabled !== undefined) {
            query += `, notifications_enabled = $3`;
            params.push(notificationsEnabled);
        }

        query += ` WHERE firebase_uid = $2 RETURNING points, country`;

        const updateRes = await pool.query(query, params);

        if (updateRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        res.json({ success: true, points: updateRes.rows[0].points, country: updateRes.rows[0].country });
    } catch (err) {
        console.error("Update User Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/worldcup/user/update_notifications', async (req, res) => {
    try {
        const { idToken, notificationsEnabled } = req.body;
        if (!idToken) return res.status(400).json({ error: 'Missing parameter' });

        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        await pool.query(`
            UPDATE worldcup_users
            SET notifications_enabled = $1
            WHERE firebase_uid = $2
        `, [notificationsEnabled, uid]);

        res.json({ success: true });
    } catch (err) {
        console.error("Update Notifications Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/worldcup/checkin', async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ error: 'No token provided' });

        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const userRes = await pool.query('SELECT last_checkin, points FROM worldcup_users WHERE firebase_uid = $1', [uid]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = userRes.rows[0];
        
        const getNepalLocalDateStr = (dateObj) => {
            if (!dateObj) return null;
            const nepalTime = new Date(dateObj.getTime() + (5.75 * 3600 * 1000));
            return nepalTime.toISOString().slice(0, 10);
        };

        const todayNepalStr = getNepalLocalDateStr(new Date());
        const lastCheckinNepalStr = user.last_checkin ? getNepalLocalDateStr(new Date(user.last_checkin)) : null;

        if (lastCheckinNepalStr === todayNepalStr) {
            return res.status(400).json({ error: 'Already checked in today' });
        }

        const updateRes = await pool.query(`
            UPDATE worldcup_users 
            SET points = points + 50, last_checkin = NOW() 
            WHERE firebase_uid = $1 
            RETURNING points
        `, [uid]);

        res.json({ success: true, points: updateRes.rows[0].points });
    } catch (err) {
        console.error("Checkin Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/worldcup/draw-status', async (_req, res) => {
    try {
        const predictorsRes = await pool.query(`
            SELECT COUNT(DISTINCT user_id) as count 
            FROM worldcup_predictions 
            WHERE created_at::date = CURRENT_DATE
        `);
        const predictorsCountToday = parseInt(predictorsRes.rows[0].count, 10);

        const latestDrawRes = await pool.query(`
            SELECT * FROM worldcup_spin_winners 
            ORDER BY draw_date DESC LIMIT 1
        `);
        
        const latestDraw = latestDrawRes.rows[0] || null;

        res.json({
            success: true,
            predictorsCountToday,
            latestDraw: latestDraw ? {
                id: latestDraw.id,
                drawDate: latestDraw.draw_date,
                matchId: latestDraw.match_id,
                matchName: latestDraw.match_name,
                prizeUnlocked: latestDraw.prize_unlocked,
                predictorsCount: latestDraw.predictors_count,
                correctPredictors: latestDraw.correct_predictors_json ? JSON.parse(latestDraw.correct_predictors_json) : [],
                winnerName: latestDraw.winner_name
            } : null
        });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/worldcup/test-draw', checkAuth, async (req, res) => {
    try {
        await runWorldCupDraw();
        res.json({ success: true, message: "Draw execution complete. Check server logs." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/worldcup/predict', async (req, res) => {
    try {
        const { idToken, matchId, scoreA, scoreB } = req.body;
        if (!idToken || !matchId) return res.status(400).json({ error: 'Missing data' });
        
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        const userRes = await pool.query('SELECT id FROM worldcup_users WHERE firebase_uid = $1', [uid]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const userId = userRes.rows[0].id;

        // Check match time limits (5-minute lock before kickoff)
        const gamesRes = await fetch('https://worldcup26.ir/get/games');
        const gamesData = await gamesRes.json();
        const game = gamesData.games.find(g => String(g.id) === String(matchId));
        if (!game) {
            return res.status(404).json({ error: 'Match not found' });
        }

        const matchTime = new Date(game.local_date).getTime();
        const now = Date.now();
        const isLocked = isNaN(matchTime) || (matchTime - now <= 300000) || game.finished === "TRUE" || game.time_elapsed !== "notstarted";
        if (isLocked) {
            return res.status(400).json({ error: 'Predictions for this match are locked (closes 5 minutes before kickoff).' });
        }

        // Check if user has already predicted this match
        const checkPred = await pool.query(
            'SELECT 1 FROM worldcup_predictions WHERE user_id = $1 AND match_id = $2',
            [userId, matchId]
        );
        const isNewPrediction = checkPred.rows.length === 0;
        
        await pool.query(`
            INSERT INTO worldcup_predictions (user_id, match_id, score_a, score_b)
                        VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, match_id)
            DO UPDATE SET score_a = EXCLUDED.score_a, score_b = EXCLUDED.score_b
        `, [userId, matchId, scoreA, scoreB]);

        if (isNewPrediction) {
            await pool.query('UPDATE worldcup_users SET points = points + 10 WHERE id = $1', [userId]);
            console.log(`Awarded +10 points to user ${userId} for new prediction on match ${matchId}`);
        }
        
        const pointsRes = await pool.query('SELECT points FROM worldcup_users WHERE id = $1', [userId]);
        res.json({ success: true, points: pointsRes.rows[0].points });
    } catch (err) {
        console.error("Prediction Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Create tables if they don't exist
const initializeDatabase = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS worldcup_notifications (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                icon VARCHAR(50) DEFAULT '🔔',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database tables initialized.");
    } catch (err) {
        console.error("Error initializing tables:", err);
    }
};
initializeDatabase();

app.post('/api/worldcup/users', async (req, res) => {
    try {
        const { name, email, notificationsEnabled } = req.body;
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
        const result = await pool.query(`
            SELECT u.name, u.points, u.country 
            FROM worldcup_users u
            WHERE EXISTS (
                SELECT 1 FROM worldcup_predictions p WHERE p.user_id = u.id
            )
            ORDER BY u.points DESC 
            LIMIT 50
        `);
        res.json(result.rows);
    } catch(err) { res.status(500).json({ error: err.message }); }
});

// ─── WORLDCUP NOTIFICATIONS API ──────────────────────────────────────────────
app.get('/api/worldcup/notifications', async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM worldcup_notifications ORDER BY created_at DESC LIMIT 20');
        res.json(result.rows);
    } catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/worldcup/admin/notifications', checkAuth, async (req, res) => {
    try {
        const { title, message, icon } = req.body;
        if (!title || !message) return res.status(400).json({ error: 'Title and message are required' });
        await pool.query(
            'INSERT INTO worldcup_notifications (title, message, icon) VALUES ($1, $2, $3)',
            [title, message, icon || '🔔']
        );
        res.json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/worldcup/admin/notifications/:id', checkAuth, async (req, res) => {
    try {
        await pool.query('DELETE FROM worldcup_notifications WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

// ─── AUTOMATED 12 PM Winner draw CRON ────────────────────────────────────────
cron.schedule('0 12 * * *', async () => {
    await runWorldCupDraw();
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin/index.html`);
});
