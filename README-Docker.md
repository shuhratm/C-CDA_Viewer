# Personal C-CDA Medical Records Viewer

A dockerized version of the HL7 C-CDA Viewer, customized for personal medical records management.

## Features

- View C-CDA (Clinical Document Architecture) documents in a human-readable format
- Interactive document sections (hide, collapse, expand, reorder)
- Responsive design that works on desktop, tablet, and mobile
- Personal medical records from your local folder
- No authentication required (designed for home network use)

## Quick Start

### 1. Set up your medical records folder

Create a folder on your server containing your C-CDA XML files:

```bash
mkdir ~/medical-records
# Copy your .xml files to this directory
```

### 2. Configure the application

Edit the `.env` file to match your setup:

```bash
# Port for the web application
PORT=3000

# Path to your medical records folder (absolute path recommended)
RECORDS_PATH=/home/user/medical-records
```

### 3. Deploy with Docker Compose

```bash
# Build and start the application
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### 4. Access the application

Open your browser and navigate to:
- `http://your-server-ip:3000` (or whatever port you configured)
- `http://localhost:3000` if running locally

## Directory Structure

```
├── docker-compose.yml          # Docker Compose configuration
├── .env                       # Environment variables
├── Dockerfile                 # Docker build instructions
├── server.js                  # Node.js backend server
├── package.json              # Node.js dependencies
├── public/                    # Frontend files
│   ├── index.htm             # Main application page
│   ├── js/                   # JavaScript files
│   ├── css/                  # Stylesheets
│   └── cda.xsl              # XSL transformation file
└── medical-records/          # Your C-CDA files (mounted volume)
```

## Environment Variables

- `PORT`: Port number for the web server (default: 3000)
- `RECORDS_PATH`: Absolute path to your medical records folder

## API Endpoints

- `GET /`: Main application interface
- `GET /api/files`: List all XML files in the medical records directory
- `GET /api/file/:filename`: Retrieve a specific C-CDA file
- `GET /health`: Health check endpoint

## Security Notes

- This application is designed for home network use only
- No authentication is implemented
- Do not expose to the internet without proper security measures
- Files are served read-only from the mounted volume

## Troubleshooting

### No files showing up
1. Check that your `RECORDS_PATH` in `.env` points to the correct directory
2. Ensure XML files are present in the medical records folder
3. Check container logs: `docker-compose logs`

### Permission issues
1. Ensure the medical records folder has proper read permissions
2. The folder is mounted as read-only (`:ro`) for security

### Port conflicts
1. Change the `PORT` in `.env` to an available port
2. Restart with `docker-compose down && docker-compose up -d`

## Original C-CDA Viewer

This is based on the HL7 C-CDA Viewer by Bryn Lewis, winner of the HL7 C-CDA Tooling Challenge.
Original repository: https://github.com/brynlewis/C-CDA_Viewer