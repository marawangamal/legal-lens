# Legal Lens

A Next.js application for uploading, viewing, and analyzing images using AI.

## Features

- 📁 **Folder Upload**: Upload entire folders of files at once
- 📊 **File Management**: View file details including name, type, size, and modification date
- 👁️ **Document Viewer**: Built-in viewer for images, PDFs, and text files with navigation
- 🤖 **AI Analysis**: Analyze images using a local LLM (Ollama) with vision capabilities
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Supported File Types

### Viewing

- Images (JPG, PNG, GIF, WebP, etc.)
- PDFs
- Text files (.txt, .md)

### AI Analysis

- **Images only**: JPG, PNG, GIF, WebP, BMP, TIFF, SVG

## Prerequisites

1. **Node.js** (v18.17.1 or higher)
2. **Ollama** installed and running locally
3. **Vision model** installed in Ollama (e.g., `qwen2.5vl`)

## Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd legal-lens
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Install and start Ollama**:

   ```bash
   # Install Ollama (follow instructions at https://ollama.ai)
   # Pull a vision model
   ollama pull qwen2.5vl
   # Start Ollama
   ollama serve
   ```

4. **Start the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## Usage

1. **Upload Files**: Click "Click to select a folder" to upload a folder of files
2. **View Files**: Click "View" to open the document viewer with navigation
3. **Analyze Images**: Click "Analyze" on image files to get AI analysis
4. **Navigate**: Use arrow keys or buttons to navigate between files in the viewer

## API Endpoints

### `/api/analyze`

Analyzes images using the local Ollama LLM.

**Method**: POST  
**Content-Type**: multipart/form-data

**Parameters**:

- `file`: Image file to analyze

**Response**:

```json
{
  "analysis": "AI analysis of the image",
  "fileName": "image.jpg",
  "fileSize": 12345,
  "fileType": "image/jpeg"
}
```

## Configuration

The application is configured to connect to Ollama at `http://127.0.0.1:11434` using the `qwen2.5vl` model.

## Development

- **Format on Save**: ESLint and Prettier are configured for automatic formatting
- **TypeScript**: Full TypeScript support with strict type checking
- **Tailwind CSS**: Utility-first CSS framework for styling

## Troubleshooting

### Connection Refused Error

- Ensure Ollama is running: `ollama serve`
- Check that the model is installed: `ollama list`
- Verify the API endpoint in the code matches your Ollama setup

### Analysis Timeout

- The analysis has a 30-second timeout
- If it times out, try with a smaller image or restart Ollama

### Unsupported File Types

- Only image files can be analyzed
- PDFs and other files can still be viewed in the document viewer

## License

This project is licensed under the MIT License.
