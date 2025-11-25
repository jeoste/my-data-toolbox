# My Data Toolbox

> A modern web application to generate realistic JSON test data, anonymize sensitive fields, validate and query JSON, and work with Swagger/OpenAPI.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.0%2B-green.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)](https://vercel.com)

## 📸 Screenshots

> Place screenshots in `screenshots/` as described in `screenshots/README.md`.

- Main Interface — sidebar + content
- Data Generation — skeleton to generated JSON
- Data Anonymization — before/after preview
- Configuration — dialogs and options
- Preview — formatted output

## ✨ Features

- Generate realistic data from JSON skeletons (Python engine, Faker)
- Optional Swagger/OpenAPI constraints during generation
- JSON anonymization (preserve structure/relationships)
- JSON validation and pretty-print
- JSONPath querying with live evaluation
- Convert JSON example → OpenAPI schema (helper)
- Build skeletons from OpenAPI schemas (helper)
- Modern UI: dark/light themes, i18n (EN/FR/KO)

## 🧱 Tech Stack

**Frontend:**
- React 18 + TypeScript, Vite 5, Tailwind CSS, shadcn/ui
- i18next (internationalisation), Lucide React (icônes), JSONPath-Plus

**Backend:**
- Python 3.9+ serverless functions on Vercel
- Flask handlers for API endpoints
- Python modules: `faker`, `pyyaml`, `jsonschema`, `openapi-spec-validator`

**Infrastructure:**
- Vercel (hosting + serverless functions)
- GitHub (CI/CD)

## 🗂️ Project Structure

```
my-data-toolbox/
├─ api/                     # Vercel serverless functions (Python)
│  ├─ generate.py          # POST /api/generate
│  ├─ anonymize.py         # POST /api/anonymize
│  └─ analyze.py           # POST /api/analyze
├─ src/                     # Frontend React (Web)
│  ├─ components/
│  │  ├─ views/            # Generate / Anonymize / Swagger / Validator / JSONPath
│  │  └─ ui/               # shadcn/ui components
│  ├─ hooks/
│  ├─ locales/             # i18n resources (en, fr, ko)
│  ├─ lib/                  # API client, utilities
│  ├─ globals.css
│  └─ main.tsx
├─ lib/                     # Python modules (shared)
│  ├─ data_generator.py
│  ├─ data_anonymizer.py
│  ├─ json_processor.py
│  └─ swagger_parser.py
├─ examples/                # Sample skeletons and swagger specs
├─ docs/                    # Plan & release notes
└─ screenshots/             # Marketing screenshots
```

## 🔧 Prerequisites

- Node.js 18.0+ (required by Vite 5)
- Python 3.9+ (for local development)
- npm or yarn

## 🚀 Quick Start (Development)

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Install Python dependencies (for local testing):
```bash
pip install -r requirements.txt
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Testing Serverless Functions Locally

To test the Python serverless functions locally, use Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

This will start a local server that simulates the Vercel environment.

## 📦 Build & Distribution

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deploy to Vercel

1. **Connect your repository:**
   - Push your code to GitHub
   - Import your repository in [Vercel](https://vercel.com)
   - Vercel will automatically detect the project settings

2. **Configure environment variables (if needed):**
   - Go to your project settings in Vercel
   - Add any required environment variables

3. **Deploy:**
   - Vercel will automatically deploy on every push to the main branch
   - Preview deployments are created for pull requests

The application will be available at `https://your-project.vercel.app`

### Manual Deployment

```bash
npm install -g vercel
vercel
```

## 🧪 Available NPM Scripts

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## 🌐 API Endpoints

The application exposes the following REST API endpoints:

### POST /api/generate

Generate JSON data from a skeleton.

**Request:**
```json
{
  "skeleton": { ... },
  "swagger": { ... },  // optional
  "options": {
    "count": 5,
    "seed": 42,
    "locale": "en_US"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "generatedAt": "2025-11-25T10:30:00Z",
    "itemCount": 5
  }
}
```

### POST /api/anonymize

Anonymize sensitive data in JSON.

**Request:**
```json
{
  "data": { ... },
  "options": {
    "locale": "en_US"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "anonymizedFields": 12,
    "processedAt": "2025-11-25T10:30:00Z"
  }
}
```

### POST /api/analyze

Analyze sensitive fields in JSON data.

**Request:**
```json
{
  "data": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "sensitiveFields": ["user.email", "user.phone"],
  "totalFields": 2
}
```

## 🗺️ Roadmap

See `docs/plan.md` for the current roadmap (accounts, sync, updates, tests, etc.).

## 🛠️ Troubleshooting

- **"npm command not found"**: Install Node.js from `https://nodejs.org`, then verify with `node --version`.
- **Build fails**: Ensure Node.js 18+ is installed and all dependencies are installed with `npm install`.
- **API errors**: Check browser console for error messages. Ensure the serverless functions are properly deployed on Vercel.
- **Local development issues**: Make sure Vite dev server is running on port 5173. Check for port conflicts.

## 🔄 Migration from Electron Version

If you were using the Electron desktop version:

- **File operations**: Now handled via browser File API (drag-and-drop or file picker)
- **No local file system access**: Files must be imported/exported through the browser
- **Same functionality**: All features are preserved, just accessed through a web interface
- **Better accessibility**: Works on any device with a modern browser

## 🙌 Acknowledgments

- UI design inspired by Acreom
- shadcn/ui, Radix UI, Lucide Icons
- Electron, Vite, Tailwind CSS
- Faker, JSONPath-Plus

## 📄 License

MIT — see `LICENSE`.

## 💬 Support

- Issues: `https://github.com/jeoste/my-data-toolbox/issues`
- Discussions: `https://github.com/jeoste/my-data-toolbox/discussions`
- Contact: jeoffrey.stephan.pro@gmail.com 