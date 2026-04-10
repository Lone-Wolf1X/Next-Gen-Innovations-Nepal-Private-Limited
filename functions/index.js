const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for base64 banner images

// Simple Auth
const AUTH_PASSWORD = 'admin';
const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === `Basic ${Buffer.from(`admin:${AUTH_PASSWORD}`).toString('base64')}`) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// ─── EXISTING RESOURCES ──────────────────────────────────────────────────────
const resources = ['founders', 'terms', 'notices', 'careers'];

resources.forEach(resource => {
    app.get(`/${resource}`, async (req, res) => {
        try {
            if (resource === 'notices' || resource === 'terms') {
                const doc = await db.collection(resource).doc('current').get();
                return res.json(doc.exists ? doc.data() : {});
            }
            const snapshot = await db.collection(resource).get();
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post(`/${resource}`, checkAuth, async (req, res) => {
        try {
            if (resource === 'notices' || resource === 'terms') {
                await db.collection(resource).doc('current').set(req.body);
            } else {
                const batch = db.batch();
                const currentDocs = await db.collection(resource).get();
                currentDocs.forEach(doc => batch.delete(doc.ref));
                req.body.forEach(item => {
                    const ref = db.collection(resource).doc();
                    batch.set(ref, item);
                });
                await batch.commit();
            }
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
});

// ─── HERO BANNERS ─────────────────────────────────────────────────────────────
// Public: returns only active banners (no image data, just metadata + url)
app.get('/heroBanners', async (req, res) => {
    try {
        const doc = await db.collection('heroBanners').doc('current').get();
        const data = doc.exists ? doc.data() : { banners: [] };
        const banners = (data.banners || []).filter(b => b.active !== false);
        res.json({ banners });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: returns all banners including inactive (with full image data)
app.get('/heroBanners/all', checkAuth, async (req, res) => {
    try {
        const doc = await db.collection('heroBanners').doc('current').get();
        const data = doc.exists ? doc.data() : { banners: [] };
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save all banners (replaces the entire banners array)
app.post('/heroBanners', checkAuth, async (req, res) => {
    try {
        await db.collection('heroBanners').doc('current').set(req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── CONTACT QUERIES ──────────────────────────────────────────────────────────
// Admin: get all queries sorted by newest first
app.get('/queries', checkAuth, async (req, res) => {
    try {
        const snapshot = await db.collection('queries').orderBy('timestamp', 'desc').get();
        const data = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                ...d,
                timestamp: d.timestamp ? d.timestamp.toDate().toISOString() : new Date().toISOString()
            };
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Public: submit a contact query
app.post('/queries', async (req, res) => {
    try {
        const query = {
            ...req.body,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
            status: 'new'
        };
        await db.collection('queries').add(query);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: mark query as read or update status
app.patch('/queries/:id', checkAuth, async (req, res) => {
    try {
        await db.collection('queries').doc(req.params.id).update(req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: delete a query
app.delete('/queries/:id', checkAuth, async (req, res) => {
    try {
        await db.collection('queries').doc(req.params.id).delete();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

exports.api = functions.https.onRequest(app);
