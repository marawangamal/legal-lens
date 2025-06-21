import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { z } from 'zod';

const DiscrepancySchema = z.object({
  hasDiscrepancies: z.boolean(),
  summary: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { documents } = await request.json();

    if (!documents?.length) {
      return NextResponse.json(
        { error: 'No documents provided' },
        { status: 400 }
      );
    }

    const prompt = `Analyze these documents for discrepancies. Return a JSON response with hasDiscrepancies (boolean) and summary (string):

${JSON.stringify(documents, null, 2)}`;

    const response = await fetch(`${config.ollama.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollama.model,
        prompt,
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const result = await response.json();
    const parsed = JSON.parse(result.response);
    const validatedResponse = DiscrepancySchema.parse(parsed);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('Discrepancy analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
