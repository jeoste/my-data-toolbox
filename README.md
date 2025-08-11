# JSON Tools — JSON Data Generator & Anonymizer

> A modern desktop application to generate realistic JSON test data, anonymize sensitive fields, validate and query JSON, and work with Swagger/OpenAPI.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.0%2B-green.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.7%2B-blue.svg)](https://python.org)
[![Electron](https://img.shields.io/badge/Electron-Desktop-lightgrey.svg)](https://electronjs.org)

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

- Electron (main/preload), React 18 + TypeScript, Vite 5, Tailwind CSS, shadcn/ui
- Python backend (CLI) for generation/anonymization: `faker`, `pyyaml`, `jsonschema`, `openapi-spec-validator`

## 🗂️ Project Structure

```
json-tools/
├─ electron/                 # Desktop app (UI + Electron)
│  ├─ main.js               # Electron main process
│  ├─ preload.js            # Secured IPC bridge
│  ├─ src/                  # React app
│  │  ├─ App.tsx
│  │  ├─ components/
│  │  │  ├─ views/          # Generate / Anonymize / Swagger / Validator / JSONPath
│  │  │  └─ ui/             # shadcn/ui components
│  │  ├─ hooks/
│  │  ├─ locales/           # i18n resources (en, fr, ko)
│  │  ├─ globals.css
│  │  └─ main.tsx
│  └─ package.json
├─ src/                     # Python backend (CLI)
│  ├─ cli_generate.py       # Entry point for generation/anonymization
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
- Python 3.7+ (recommended 3.10/3.11)
- Windows 10+ / macOS / Linux

## 🚀 Quick Start (Development)

From the repository root:

```powershell
npm run install          # installs Electron app dependencies (inside ./electron)
npm run electron:dev     # starts Vite dev server + launches Electron
```

Notes
- On first run, Python dependencies from `requirements.txt` may be installed automatically by the app (dev mode). If needed, install them manually:
  ```powershell
  py -m pip install -r requirements.txt
  ```
- The UI runs on `http://localhost:5173` and Electron opens it automatically.

## 📦 Build & Distribution

- Build UI only (Vite production build):
  ```powershell
  npm run build
  ```
- Build Windows installer (Electron Builder):
  ```powershell
  cd electron
  npm run electron:build-win
  ```
  The installer will be generated in `electron/dist-electron/`.

> Auto-update is prepared (GitHub Releases) but currently disabled by default while stabilizing the pipeline. See `electron/UPDATE-SYSTEM-SUMMARY.md` and `docs/RELEASE.md`.

## 🖥️ Using the Python CLI directly

Run the CLI without the UI for automation or testing.

- Generate from skeleton:
  ```powershell
  py .\src\cli_generate.py --skeleton .\examples\skeleton_example.json --pretty
  ```
- Generate with Swagger/OpenAPI constraints:
  ```powershell
  py .\src\cli_generate.py --skeleton .\examples\skeleton_example.json --swagger .\examples\swagger_example.yaml --pretty
  ```
- Anonymize a JSON file:
  ```powershell
  py .\src\cli_generate.py --anonymize .\examples\test_anonymization.json --pretty
  ```
- Analyze sensitive fields:
  ```powershell
  py .\src\cli_generate.py --analyze .\examples\user_example.json --pretty
  ```

## 🧪 Available NPM Scripts (root)

```bash
npm run install         # cd electron && npm install
npm run dev             # cd electron && npm run dev (Vite only)
npm run electron:dev    # cd electron && npm run electron:dev (Electron + Vite)
npm run build           # cd electron && npm run build (Vite build)
```

> For packaging, use the commands from the `electron/` directory (e.g., `npm run electron:dist`, `npm run electron:build`, `npm run electron:build-win`).

> Tip: prefer `npm run electron:dev` during development.

## 🗺️ Roadmap

See `docs/plan.md` for the current roadmap (accounts, sync, updates, tests, etc.).

## 🛠️ Troubleshooting

- “Python not found”: Install Python from `https://python.org`, check “Add Python to PATH”, restart the terminal.
- “npm command not found”: Install Node.js from `https://nodejs.org`, then verify with `node --version`.
- App won’t start: ensure `npm run install` succeeded, Python and Node meet version requirements, and check the console logs.

## 🙌 Acknowledgments

- UI design inspired by Acreom
- shadcn/ui, Radix UI, Lucide Icons
- Electron, Vite, Tailwind CSS
- Faker, JSONPath-Plus

## 📄 License

MIT — see `LICENSE`.

## 💬 Support

- Issues: `https://github.com/jeoste/json-tools/issues`
- Discussions: `https://github.com/jeoste/json-tools/discussions`
- Contact: jeoffrey.stephan.pro@gmail.com 