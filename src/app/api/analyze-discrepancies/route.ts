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

    const prompt = `Here is a list of documents that will be used in an immigration application to canada. Check for any pottential discrepancies/issues with these documents. Return a JSON response with hasDiscrepancies (boolean) and summary (string):

${JSON.stringify(documents, null, 2)}`;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 seconds

    try {
      const response = await fetch(`${config.ollama.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.ollama.reasoningModel,
          prompt,
          stream: false,
          format: 'json',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const result = await response.json();
      const parsed = JSON.parse(result.response);
      const validatedResponse = DiscrepancySchema.parse(parsed);

      return NextResponse.json(validatedResponse);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Request timed out after 45 seconds');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Discrepancy analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
