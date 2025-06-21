import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { PDocument } from '@/types/schemas';

export async function POST(request: NextRequest) {
  console.log('🚀 API: /api/analyze');

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file)
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!file.type.startsWith('image/'))
      return NextResponse.json(
        { error: 'Only image files are supported' },
        { status: 400 }
      );

    const base64Data = Buffer.from(await file.arrayBuffer()).toString('base64');

    const response = await fetch(`${config.ollama.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollama.model,
        prompt: `Parse all visible information from this client's document it could be an identity document or some govermental form. Structure your response as a JSON object. Also add a document_type field to the response.`,
        images: [base64Data],
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) throw new Error(`LLM API error: ${response.status}`);

    const result = await response.json();
    const parsed = JSON.parse(result.response);
    const validatedResponse = PDocument.parse(parsed);
    return NextResponse.json(validatedResponse);
  } catch (error) {
    if (error instanceof Error && error.message.includes('ZodError')) {
      console.error('Schema validation error:', error);
      return NextResponse.json(
        { error: 'Invalid response format from analysis' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
