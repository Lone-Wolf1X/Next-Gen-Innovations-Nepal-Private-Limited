const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, '../data');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../admin')));

// Simple Auth Middleware (Mock)
const AUTH_PASSWORD = 'admin'; // User can change this
const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === `Basic ${Buffer.from(`admin:${AUTH_PASSWORD}`).toString('base64')}`) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Generic helper to read/write JSON
const getFilePath = (filename) => path.join(DATA_DIR, `${filename}.json`);

const readData = (filename) => {
    try {
        return JSON.parse(fs.readFileSync(getFilePath(filename), 'utf8'));
    } catch (err) {
        console.error(`Error reading ${filename}:`, err);
        return null;
    }
};

const writeData = (filename, data) => {
    try {
        fs.writeFileSync(getFilePath(filename), JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error(`Error writing ${filename}:`, err);
        return false;
    }
};

// API Endpoints
const resources = ['founders', 'terms', 'notices', 'careers'];

resources.forEach(resource => {
    // GET
    app.get(`/api/${resource}`, (req, res) => {
        const data = readData(resource);
        if (data) res.json(data);
        else res.status(404).json({ error: 'Not found' });
    });

    // POST (Protected)
    app.post(`/api/${resource}`, checkAuth, (req, res) => {
        if (writeData(resource, req.body)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Failed to write data' });
        }
    });
});

// Serve frontend static files if needed (optional for production)
app.use('/', express.static(path.join(__dirname, '../')));

app.listen(PORT, () => {
    console.log(`Admin Server running at http://localhost:${PORT}`);
    console.log(`Admin UI accessible via http://localhost:${PORT}/admin`);
});
