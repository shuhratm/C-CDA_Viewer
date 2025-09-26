<h1>Personal C-CDA Medical Records Viewer</h1>

A dockerized personal medical records application based on the award-winning HL7 C-CDA Viewer.

**Original C-CDA Viewer**: Winner of the <a href="http://blog.hl7.org/hl7ccdachallenge" target="_blank">HL7 C-CDA Tooling Challenge</a>
You can cite the original repository: <a href="https://zenodo.org/badge/latestdoi/58436029"><img src="https://zenodo.org/badge/58436029.svg" alt="DOI"></a>

<h2>Personal Medical Records Features</h2>
Transform your C-CDA documents from healthcare providers into an intuitive, personal medical records vieweing platform:

- **📋 Smart Metadata Display**: Automatically extracts and displays patient names and actual visit dates from C-CDA files (mostly works)
- **🏠 Home Server Deployment**: Docker-based deployment for secure access on your home network
- **📁 Folder-Based Management**: Simply place XML files in a folder - no database required
- **🎨 Card-Based Interface**: Clean, modern interface showing patient info and encounter dates at a glance
- **🔒 Privacy-First**: No cloud services, no external dependencies - your medical data stays on your server

<img width="350" height="376" alt="SCR-20250926-lupw" src="https://github.com/user-attachments/assets/1848d52b-6355-4206-a823-e3b57b2b55dd" /> <img width="399" height="376" alt="SCR-20250926-lvcs" src="https://github.com/user-attachments/assets/5ea51b08-3c97-4cba-9340-2a73f8e7d166" />
<h2>Enhanced Personal Interface</h2>
The interface has been redesigned for personal use. It was tested using WellSpan XML exports.

- **Patient Name Extraction**: Automatically shows "Firstname Lastname" from C-CDA patient records
- **Actual Visit Dates**: Displays real encounter dates instead of document export dates
- **Professional Cards**: Each record shown as a clean card with key information
- **Quick Navigation**: Click any card to instantly view the full C-CDA document
- **Loading Indicators**: Smooth loading states while parsing XML metadata

<h2>Platform</h2>
<ul>
<li>Tested on Safari and Edge.</li>
</ul>

<h2>Demonstration</h2>
A demonstration version of the original unmodified repo is deployed here:
http://brynlewis.org/challenge/index.htm

<h2>Features</h2>
<ul>
<li>Users can control document layout via Section hide/show, collapse/expand and re-ordering. </li>
<li>As user makes changes, the layout adjusts to make best use of available screen space.</li>
<li>All changes are saved as preferences that will apply across documents (ie open a new document and the same order/visibility preferences are applied against all sections).</li>
<ul>
	<li>Sections are identified via coding applied across documents.</li>
	<li>eg. If 'Procedures' has been moved to the top of the document, then 'Procedures' will be at the top of the next document opened</li>
</ul>
Duplicate entries in tables are detected. The user can decide whether these are hidden or shown.
</ul>

<h2>Move and Re-Ordering</h2>
<ul>
<li>Drag and Drop a section where you want it to go.</li>
<li>Move a section up to the top of the list by clicking on the double-up arrow.</li>
<li>Move a section down one by clicking on the single-down arrow.</li>
</ul>

<h2>Show/Hide Sections</h2>
<ul>
<li>Hide sections by clicking on the cross, or from the Table Of Contents (TOC)</li>
</ul>

<h2>Collapse/Expand sections</h2>
<ul>
<li>Click the collapse/expand icon on any section.</li>
<li>Collapse/Expand all section with the Collapse/Expand all button.</li>
</ul>

<h2>TOC (Table Of Contents)</h2>
<ul>
<li>Use the TOC to see all available sections in the document, and to show/hide or move sections.</li>
<li>Reset all preferences to defaults.</li>
</ul>

<h2>Personal Home Server Deployment</h2>

<h3>Quick Start with Docker</h3>
Deploy your personal medical records viewer in minutes:

**Prerequisites:**
- Docker and Docker Compose installed on your server
- A folder containing your C-CDA XML files from healthcare providers

**Steps:**
1. **Clone the repository:**
   ```bash
   git clone https://github.com/shuhratm/C-CDA_Viewer.git
   cd C-CDA_Viewer
   ```

2. **Configure your medical records path:**
   Edit the `.env` file:
   ```bash
   # Port for the web application
   PORT=3000

   # Path to your medical records folder (absolute path recommended)
   RECORDS_PATH=/path/to/your/medical-records
   ```

3. **Deploy:**
   ```bash
   docker-compose up -d
   ```

4. **Access your medical records:**
   Open `http://your-server-ip:3000` in a browser

<h3>Detailed Configuration</h3>

**Environment Variables (.env file):**
- `PORT`: Web application port (default: 3000)
- `RECORDS_PATH`: Absolute path to folder containing your C-CDA XML files

**Supported File Formats:**
- Any `.xml` file containing valid C-CDA documents
- Files from major healthcare providers (Epic, Cerner, AllScripts, etc.)
- Documents downloaded from patient portals

**Network Access:**
- Designed for home network use (no authentication required)

<h3>File Management</h3>

- **Adding Records**: Simply copy new XML files to your medical records folder
- **Organization**: Files are automatically sorted and displayed with metadata
- **No Database**: Everything runs from your files - no complex setup required

<h3>Security & Privacy</h3>

- **Local Only**: All processing happens on your server
- **No Cloud**: No data sent to external services
- **Read-Only**: Original files are never modified
- **Docker Isolation**: Application runs in s docker container

<h3>Troubleshooting</h3>

- **No files showing**: Check `RECORDS_PATH` points to correct folder with XML files
- **Permission errors**: Ensure medical records folder has read permissions
- **Port conflicts**: Change `PORT` in `.env` file to available port
- **View logs**: `docker-compose logs -f`

<h3>Original Static Deployment (Legacy)</h3>
For the original static file deployment:

- Download the fileset and open 'index.htm' in a web browser
- Or deploy to a web server at: `http://yoururl/[C-CDA_Viewer_path]/index.htm`

<h2>Technical Architecture</h2>

<h3>Personal Medical Records Application</h3>
**Backend (Node.js/Express):**
- `server.js`: Express server with medical records API endpoints
- `xml2js`: XML parsing for metadata extraction from C-CDA documents. Modify as needed for your provider's format. Current parsing works on WellSpan XML records.
- `/api/files`: Lists medical records with patient names and encounter dates
- `/api/file/:filename`: Serves individual C-CDA documents

**Frontend Enhancements:**
- `core.js`: Enhanced with metadata display and card-based interface
- `cda.css`: Added responsive card styling for medical records
- Smart loading states and modern UI components

**Metadata Extraction:**
- Patient names from `recordTarget/patientRole/patient/name` structure
- Encounter dates from actual visit records (not document export dates)
- Fallback logic for different C-CDA structures and formats

<h3>Original C-CDA Viewer Core</h3>
**XSLT Processing:**
- `xslt.js`: Browser-based XSL transformation library (updated for IE11 compatibility)
- `cda.xsl`: Extended ANSI/HL7 CDAR2 v.3 stylesheet with dynamic layout functionality
- Transformation: `new Transformation().setXml(cdaxml).setXslt('cda.xsl').transform("viewcda")`

**UI Libraries:**
- **Layout**: Packery.js library for responsive grid layout
- **Drag & Drop**: Draggabilly for section reordering
- **Icons**: Font Awesome icon set
- **Styling**: Pure CSS framework

**Document Structure:**
- `cdaxml`: C-CDA XML document string
- `cda.xsl`: Local XSL transformation file
- `viewcda`: Target HTML div for rendered content

**Modifications**
- The Original repo is dockerized and "personalized" using Claude Code.

<img src="https://github.com/user-attachments/assets/09d33f8b-aa49-4ca6-ade1-3c3fe30a8df7" width="200">

<h2>Copyright</h2>
 Copyright (c) 2016 Bryn Lewis (<mailto:brynlewis@brynlewis.org>)
<http://brynlewis.org>
 
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
