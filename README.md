# Legal Lens

Upload, view, and analyze documents with AI.

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start Ollama**:

   ```bash
   ollama pull qwen2.5vl
   OLLAMA_HOST=0.0.0.0:11434 ollama serve
   ```

3. **Run the app**:

   ```bash
   npm run dev
   ```

4. **Open** `http://localhost:3000`

## Features

- 📁 Upload folders of files
- 👁️ View images, PDFs, and text files
- 🤖 AI analysis of images using local LLM
- 🎨 Modern, responsive interface

## Supported Files

- **View**: Images, PDFs, text files
- **Analyze**: Images only (JPG, PNG, etc.)

## Requirements

- Node.js 18+
- Ollama with vision model (qwen2.5vl)

## Configuration

Copy `env.example` to `.env` and adjust the Ollama URL if needed:

```bash
cp env.example .env
```

**Note**: If you're running Ollama on a different port or host, update `OLLAMA_BASE_URL` in the `.env` file.
