import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  console.log('🚀 API route called - /api/analyze');

  try {
    console.log('📝 Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('📁 File received:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Only allow image files
    if (!file.type.startsWith('image/')) {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json(
        {
          error: 'Only image files are supported for analysis.',
          fileType: file.type,
        },
        { status: 400 }
      );
    }

    // Convert file to base64 using Node.js Buffer
    console.log('🔄 Converting file to base64...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    console.log('✅ Base64 conversion complete, length:', base64Data.length);

    // Call local LLM API using the generate endpoint with timeout
    console.log('🤖 Calling LLM API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const llmRequest = {
        model: config.ollama.model,
        prompt: `Parse all visible information. Structure your response as a JSON object.`,
        images: [base64Data],
        stream: false,
      };

      console.log('📤 Sending request to LLM:', {
        model: llmRequest.model,
        promptLength: llmRequest.prompt.length,
        imageSize: base64Data.length,
      });

      const llmResponse = await fetch(`${config.ollama.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(llmRequest),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!llmResponse.ok) {
        const errorText = await llmResponse.text();
        console.error('❌ LLM API error:', {
          status: llmResponse.status,
          statusText: llmResponse.statusText,
          error: errorText,
        });
        throw new Error(
          `LLM API error: ${llmResponse.status} ${llmResponse.statusText} - ${errorText}`
        );
      }

      console.log('✅ LLM response received');
      const result = await llmResponse.json();

      console.log('📄 Raw LLM response:', {
        responseLength: result.response?.length || 0,
        responsePreview: result.response?.substring(0, 200) + '...',
      });

      // Try to parse the response as JSON
      let parsedAnalysis;
      try {
        console.log('🔍 Attempting to parse as JSON...');

        // Handle markdown code blocks
        let responseText = result.response;

        // Handle markdown:
        if (responseText.includes('```json')) {
          console.log('📊 Detected JSON code block format');
          responseText = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '');
          console.log('📊 Response text:', responseText);
        }

        parsedAnalysis = JSON.parse(responseText);
        console.log('✅ Successfully parsed as JSON:', parsedAnalysis);
      } catch (parseError) {
        // If parsing fails, check if it's a markdown table and convert it
        console.warn('⚠️ Failed to parse LLM response as JSON:', parseError);
        parsedAnalysis = {
          failed: true,
        };
      }
      console.log('📤 Sending response:', {
        analysisKeys: Object.keys(parsedAnalysis),
        keyFieldsCount: Object.keys(parsedAnalysis.keyFields || {}).length,
      });
      return NextResponse.json(parsedAnalysis);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('⏰ Analysis timed out');
        throw new Error(
          'Analysis timed out after 60 seconds. Please try again.'
        );
      }
      console.error('❌ Error during LLM call:', error);
      throw error;
    }
  } catch (error) {
    console.error('💥 Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
