import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Only allow image files
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          error: 'Only image files are supported for analysis.',
          fileType: file.type,
        },
        { status: 400 }
      );
    }

    // Convert file to base64 using Node.js Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    // Call local LLM API using the generate endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const llmResponse = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5vl',
          prompt:
            'Parse information in the image and create a simple two-column table with the format "Field | Value". Extract all visible text, numbers, and important details. Use | to separate columns.',
          images: [base64Data],
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!llmResponse.ok) {
        const errorText = await llmResponse.text();
        throw new Error(
          `LLM API error: ${llmResponse.status} ${llmResponse.statusText} - ${errorText}`
        );
      }

      const result = await llmResponse.json();

      return NextResponse.json({
        analysis: result.response || 'No analysis available',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(
          'Analysis timed out after 60 seconds. Please try again.'
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
