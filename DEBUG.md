# Debugging Guide

This guide explains how to debug the Next.js application, particularly the `/api/analyze` route.

## Setup

### 1. VS Code Debug Configuration

The `.vscode/launch.json` file contains three debug configurations:

- **Next.js: debug server-side** - Debug server-side code (API routes)
- **Next.js: debug client-side** - Debug client-side code (React components)
- **Next.js: debug full stack** - Debug both server and client simultaneously

### 2. Enhanced Logging

The `/api/analyze` route now includes comprehensive logging with emojis for easy identification:

- 🚀 API route called
- 📝 Parsing form data
- 📁 File received
- 🔄 Converting file to base64
- 🤖 Calling LLM API
- 📤 Sending request to LLM
- ✅ LLM response received
- 📄 Raw LLM response
- 🔍 Attempting to parse as JSON
- 📊 Detected markdown table format
- ⚠️ Failed to parse LLM response as JSON
- 📤 Sending response

## How to Debug

### Method 1: VS Code Debugger (Recommended)

1. **Set breakpoints** in `src/app/api/analyze/route.ts`
2. **Start debugging**:
   - Press `F5` or go to Run and Debug panel
   - Select "Next.js: debug server-side"
   - Click the play button
3. **Trigger the API**:
   - Upload an image through the web interface, OR
   - Run the debug script: `npm run debug`

### Method 2: Console Logging

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Watch the console output** in your terminal for detailed logs

3. **Trigger the API** by uploading an image

### Method 3: Debug Script

1. **Place a test image** named `test-image.jpg` in the project root

2. **Run the debug script**:

   ```bash
   npm run debug
   ```

3. **Check the output** for detailed information about the API call

## Debug Points

### Key Areas to Set Breakpoints

1. **File Processing** (line ~30):

   ```typescript
   const formData = await request.formData();
   const file = formData.get('file') as File;
   ```

2. **Base64 Conversion** (line ~50):

   ```typescript
   const base64Data = buffer.toString('base64');
   ```

3. **LLM API Call** (line ~80):

   ```typescript
   const llmResponse = await fetch('http://127.0.0.1:11434/api/generate', {
   ```

4. **Response Parsing** (line ~120):

   ```typescript
   parsedAnalysis = JSON.parse(result.response);
   ```

5. **Markdown Table Parsing** (line ~130):
   ```typescript
   parsedAnalysis = parseMarkdownTableToJson(result.response);
   ```

## Troubleshooting

### Common Issues

1. **LLM API not running**:

   - Ensure Ollama is running: `ollama serve`
   - Check if the model is available: `ollama list`

2. **JSON parsing errors**:

   - Check the raw response in the console logs
   - The system will fall back to markdown table parsing

3. **Timeout errors**:
   - The API has a 60-second timeout
   - Large images may take longer to process

### Debug Output Examples

**Successful JSON Response**:

```
✅ Successfully parsed as JSON: {
  documentType: "Driver's License",
  keyFields: { State: "Pennsylvania", Type: "Driver's License" },
  summary: "Pennsylvania driver's license",
  confidence: "high"
}
```

**Markdown Table Fallback**:

```
⚠️ Failed to parse LLM response as JSON: SyntaxError
📊 Detected markdown table format, converting...
📊 Found data lines: 15
  1. State: Pennsylvania
  2. Type: Driver's License
  ...
```

## Tips

1. **Use the browser's Network tab** to see the actual HTTP requests
2. **Check the browser console** for client-side errors
3. **Monitor the terminal** for server-side logs
4. **Set conditional breakpoints** for specific scenarios
5. **Use the debug script** for isolated API testing
