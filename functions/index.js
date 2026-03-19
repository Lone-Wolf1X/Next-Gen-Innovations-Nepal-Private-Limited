const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

// Simple Auth (Same as before)
const AUTH_PASSWORD = 'admin';
const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === `Basic ${Buffer.from(`admin:${AUTH_PASSWORD}`).toString('base64')}`) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

const resources = ['founders', 'terms', 'notices', 'careers'];

resources.forEach(resource => {
    // GET
    app.get(`/${resource}`, async (req, res) => {
        try {
            const snapshot = await db.collection(resource).get();
            if (resource === 'notices' || resource === 'terms') {
                // These are single objects in our current logic, but Firestore stores as docs.
                // We'll store them in a doc called 'current'.
                const doc = await db.collection(resource).doc('current').get();
                return res.json(doc.exists ? doc.data() : {});
            }
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // POST
    app.post(`/${resource}`, checkAuth, async (req, res) => {
        try {
            if (resource === 'notices' || resource === 'terms') {
                await db.collection(resource).doc('current').set(req.body);
            } else {
                // Founders/Careers are arrays in local JSON, but best as separate docs in Firestore.
                // For simplicity during migration, we can overwrite the collection or handle sync.
                // Better approach: Batch update or simple separate docs.
                // Let's assume we send the whole array and we want to refresh the collection.
                
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

exports.api = functions.https.onRequest(app);
