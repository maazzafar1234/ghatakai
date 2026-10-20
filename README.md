# GhataKai

**GhataKai** — An independently developed Windows desktop assistant for transcription and AI assistance.

## Project Status: Phase 1 — Desktop Foundation

This is the initial foundation build. The frontend (React + TypeScript + Vite + Tailwind CSS) is complete. The Tauri/Rust backend is scaffolded but requires the Rust toolchain to compile.

## What's Included

- **Original GhataKai branding** — independent name, logo concept, color palette, and visual identity
- **Main desktop window** with navigation (Transcript, AI Assistant, Settings)
- **Transcript panel** with sample entries for UI testing
- **AI assistant panel** with placeholder content (no cloud AI integration)
- **Settings screen** — theme, overlay opacity, font size, audio device selection, privacy mode
- **Recording controls** — start/stop UI with device selection (placeholder until Rust backend is built)
- **Status bar** — permission, device count, error states
- **Loading, empty, permission-denied, and error states**

## What's Not Yet Implemented

- **Speech-to-text transcription** — No STT engine integrated. Transcript shows sample data only.
- **Real audio capture** — Requires Rust toolchain + `cpal`/`wasapi` integration
- **AI assistance** — No LLM integration. Placeholder responses only.
- **Local persistence** — Settings are managed in-memory; Tauri store plugin not yet wired
- **Auto-updater** — Not yet configured
- **Tray icon** — Not yet implemented

## Prerequisites

- Node.js (v20+) and npm
- Rust toolchain (cargo, rustc) — required for Tauri backend compilation
- Windows 10 or 11

## Getting Started

### Frontend (no Rust required)

```bash
cd ghatakai
npm install
npm run dev
```

This starts the Vite dev server. The app will run in the browser without Tauri backend features.

### Full Tauri Build (requires Rust)

```bash
cd ghatakai
npm install
cargo build
```

## Architecture

- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Tauri 1.x + Rust (scaffolded, not yet compiled)
- IPC: Tauri command system
- Visual identity: Original GhataKai design system (deep indigo/slate palette)

## License

MIT

**Note:** GhataKai is an independent application. No source code, assets, branding, or proprietary resources from ParakeetAI or any other application were copied.
