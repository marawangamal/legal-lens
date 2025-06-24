import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { DocumentSchema } from '@/types';

const flattenJson = (obj: any, prefix = ''): Record<string, any> => {
  const flattened: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Only include prefix if the key already exists in flattened
      const newKey = flattened.hasOwnProperty(key) ? `${prefix}_${key}` : key;
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenJson(obj[key], newKey));
      } else {
        // Add primitive values or arrays directly
        flattened[newKey] = obj[key];
      }
    }
  }

  return flattened;
};

const PROMPT =
  "Parse personal information from this document. Also tell me what type of document this is under a 'document_type' attribute and the original document language under a 'document_language' attribute. Return your response as JSON.";

// const PROMPT =
//   "Tell me what type of document this is under a 'document_type' attribute. Return your response as JSON.";

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
    try {
      const response = await fetch(`${config.ollama.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.ollama.visionModel,
          prompt: PROMPT,
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
      // Flatten json to single level
      const flattened = flattenJson(parsed);
      const validatedResponse = DocumentSchema.parse(flattened);
      console.log(flattened);

      return NextResponse.json(validatedResponse);
    } catch (fetchError) {
      // clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Request timed out after 45 seconds');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
