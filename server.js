const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const RECORDS_PATH = '/app/medical-records';

// Enable CORS for all routes
app.use(cors());

// Serve static files from public directory
app.use(express.static('public'));

// API endpoint to list C-CDA files
app.get('/api/files', (req, res) => {
    try {
        const files = fs.readdirSync(RECORDS_PATH)
            .filter(file => file.toLowerCase().endsWith('.xml'))
            .map(file => ({
                name: file,
                path: `/api/file/${encodeURIComponent(file)}`,
                displayName: file.replace('.xml', '').replace(/_/g, ' ')
            }));

        res.json(files);
    } catch (error) {
        console.error('Error reading medical records directory:', error);
        res.status(500).json({
            error: 'Unable to read medical records directory',
            files: []
        });
    }
});

// API endpoint to serve individual C-CDA files
app.get('/api/file/:filename', (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);
        const filePath = path.join(RECORDS_PATH, filename);

        // Security check: ensure the file path is within the records directory
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(path.normalize(RECORDS_PATH))) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        res.set('Content-Type', 'application/xml');
        res.send(fileContent);
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).json({ error: 'Unable to read file' });
    }
});

// Serve the main application at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.htm'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        recordsPath: RECORDS_PATH
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Personal C-CDA Viewer running on port ${PORT}`);
    console.log(`Medical records path: ${RECORDS_PATH}`);

    // Check if records directory exists
    if (fs.existsSync(RECORDS_PATH)) {
        const fileCount = fs.readdirSync(RECORDS_PATH)
            .filter(file => file.toLowerCase().endsWith('.xml')).length;
        console.log(`Found ${fileCount} XML files in medical records directory`);
    } else {
        console.warn(`Warning: Medical records directory does not exist: ${RECORDS_PATH}`);
    }
});