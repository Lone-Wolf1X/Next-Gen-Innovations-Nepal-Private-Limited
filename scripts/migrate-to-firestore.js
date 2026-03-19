const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// NOTE: You must have a service account key or be logged in via Firebase CLI
// For this script to work locally, the user needs to set GOOGLE_APPLICATION_CREDENTIALS
// or we assume they run it after 'firebase login'

admin.initializeApp();
const db = admin.firestore();

const DATA_DIR = path.join(__dirname, '../data');
const resources = ['founders', 'terms', 'notices', 'careers'];

async function migrate() {
    for (const resource of resources) {
        console.log(`Migrating ${resource}...`);
        const filePath = path.join(DATA_DIR, `${resource}.json`);
        if (!fs.existsSync(filePath)) continue;

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (resource === 'notices' || resource === 'terms') {
            await db.collection(resource).doc('current').set(data);
        } else {
            const batch = db.batch();
            data.forEach(item => {
                const ref = db.collection(resource).doc();
                batch.set(ref, item);
            });
            await batch.commit();
        }
        console.log(`Finished ${resource}`);
    }
    console.log('Migration complete!');
}

migrate().catch(console.error);
