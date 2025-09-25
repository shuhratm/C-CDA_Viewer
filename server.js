const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const xml2js = require('xml2js');

const app = express();
const PORT = process.env.PORT || 3000;
const RECORDS_PATH = '/app/medical-records';

// Enable CORS for all routes
app.use(cors());

// Serve static files from public directory
app.use(express.static('public'));

// Helper function to extract metadata from C-CDA XML
async function extractMetadata(filePath) {
    try {
        const xmlContent = fs.readFileSync(filePath, 'utf8');
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(xmlContent);

        const metadata = {
            patientName: 'Unknown Patient',
            encounterDate: null,
            dateFormatted: 'Unknown Date'
        };

        // Extract patient name from recordTarget/patientRole/patient/name
        try {
            const patient = result?.ClinicalDocument?.recordTarget?.patientRole?.patient;
            if (patient?.name) {
                const name = Array.isArray(patient.name) ? patient.name[0] : patient.name;
                const given = name.given;
                const family = name.family;

                let fullName = '';
                if (given) {
                    if (Array.isArray(given)) {
                        fullName = given.join(' ');
                    } else {
                        fullName = given;
                    }
                }
                if (family) {
                    fullName += (fullName ? ' ' : '') + family;
                }

                if (fullName) {
                    metadata.patientName = fullName;
                }
            }
        } catch (err) {
            console.warn('Could not extract patient name from', path.basename(filePath));
        }

        // Extract most recent encounter date
        try {
            let mostRecentDate = null;
            let mostRecentTimestamp = 0;

            // Look for encounters in the structured body
            const structuredBody = result?.ClinicalDocument?.component?.structuredBody;
            if (structuredBody?.component) {
                const components = Array.isArray(structuredBody.component) ? structuredBody.component : [structuredBody.component];

                for (const comp of components) {
                    const section = comp.section;
                    if (section?.entry) {
                        const entries = Array.isArray(section.entry) ? section.entry : [section.entry];

                        for (const entry of entries) {
                            const encounter = entry.encounter;
                            if (encounter?.effectiveTime) {
                                const effectiveTime = encounter.effectiveTime;
                                let dateValue = null;

                                // Handle different effectiveTime structures
                                if (effectiveTime.low?.$.value) {
                                    dateValue = effectiveTime.low.$.value;
                                } else if (effectiveTime.low?.value) {
                                    dateValue = effectiveTime.low.value;
                                } else if (effectiveTime.$.value) {
                                    dateValue = effectiveTime.$.value;
                                } else if (effectiveTime.value) {
                                    dateValue = effectiveTime.value;
                                }

                                if (dateValue) {
                                    // Parse date format YYYYMMDDHHMMSS-TIMEZONE
                                    const dateStr = dateValue.substring(0, 8); // YYYYMMDD
                                    const timeStr = dateValue.substring(8, 14) || '000000'; // HHMMSS
                                    const timestamp = parseInt(dateStr + timeStr);

                                    if (timestamp > mostRecentTimestamp) {
                                        mostRecentTimestamp = timestamp;
                                        mostRecentDate = dateStr;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // If no encounter found, fall back to documentationOf serviceEvent
            if (!mostRecentDate) {
                const serviceEvent = result?.ClinicalDocument?.documentationOf?.serviceEvent;
                if (serviceEvent?.effectiveTime?.low) {
                    const lowValue = serviceEvent.effectiveTime.low.$.value || serviceEvent.effectiveTime.low.value;
                    if (lowValue) {
                        mostRecentDate = lowValue.substring(0, 8);
                    }
                }
            }

            // Format the date
            if (mostRecentDate && mostRecentDate.length >= 8) {
                const year = mostRecentDate.substring(0, 4);
                const month = mostRecentDate.substring(4, 6);
                const day = mostRecentDate.substring(6, 8);

                const date = new Date(year, month - 1, day);
                if (!isNaN(date)) {
                    metadata.encounterDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    metadata.dateFormatted = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }
            }
        } catch (err) {
            console.warn('Could not extract encounter date from', path.basename(filePath), err.message);
        }

        return metadata;
    } catch (error) {
        console.warn('Error parsing XML for metadata:', path.basename(filePath), error.message);
        return {
            patientName: 'Unknown Patient',
            encounterDate: null,
            dateFormatted: 'Unknown Date'
        };
    }
}

// API endpoint to list C-CDA files with metadata
app.get('/api/files', async (req, res) => {
    try {
        const fileNames = fs.readdirSync(RECORDS_PATH)
            .filter(file => file.toLowerCase().endsWith('.xml'));

        const filesWithMetadata = await Promise.all(fileNames.map(async (file) => {
            const filePath = path.join(RECORDS_PATH, file);
            const metadata = await extractMetadata(filePath);

            return {
                name: file,
                path: `/api/file/${encodeURIComponent(file)}`,
                displayName: file.replace('.xml', '').replace(/_/g, ' '),
                patientName: metadata.patientName,
                encounterDate: metadata.encounterDate,
                dateFormatted: metadata.dateFormatted
            };
        }));

        res.json(filesWithMetadata);
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