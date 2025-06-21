import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { DocumentSchema } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are supported' },
        { status: 400 }
      );
    }

    const base64Data = Buffer.from(await file.arrayBuffer()).toString('base64');

    const response = await fetch(`${config.ollama.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollama.model,
        prompt: `Extract all visible information for my clientfrom this document. Only include relevant information. This could be an id card or a government document. Return as JSON with document_type field.`,
        images: [base64Data],
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const result = await response.json();
    const parsed = JSON.parse(result.response);
    const validatedResponse = DocumentSchema.parse(parsed);
    console.log(validatedResponse);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
