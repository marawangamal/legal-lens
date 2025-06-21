import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  console.log('🚀 API route called - /api/analyze-discrepancies');

  try {
    const { documents } = await request.json();

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      console.error('❌ No documents provided');
      return NextResponse.json(
        { error: 'No documents provided' },
        { status: 400 }
      );
    }

    console.log(
      '📄 Analyzing discrepancies for',
      documents.length,
      'documents'
    );

    // Prepare document summaries for analysis
    const documentSummaries = documents
      .map((doc, index) => {
        const analysis = doc.analysis;
        if (!analysis) return null;

        // Extract key information from the analysis
        const keyFields = analysis.keyFields || {};
        const summary = analysis.summary || 'No summary available';
        const documentType = analysis.documentType || 'Unknown document';

        return {
          id: index + 1,
          name: doc.name,
          type: documentType,
          summary,
          keyFields,
          extractedText: analysis.extractedText || '',
        };
      })
      .filter(Boolean);

    if (documentSummaries.length === 0) {
      return NextResponse.json(
        {
          error:
            'No documents with analysis available for discrepancy checking',
        },
        { status: 400 }
      );
    }

    // Create a comprehensive prompt for discrepancy analysis
    const discrepancyPrompt = `Analyze the following documents and identify any discrepancies, inconsistencies, or contradictions between them. 

Documents to analyze:
${documentSummaries
  .map(doc =>
    doc
      ? `
Document ${doc.id}: ${doc.name} (${doc.type})
Summary: ${doc.summary}
Key Fields: ${JSON.stringify(doc.keyFields, null, 2)}
`
      : ''
  )
  .join('\n')}

Please provide your analysis in the following JSON format:
{
  "discrepancies": [
    {
      "type": "contradiction|inconsistency|missing_info|format_mismatch",
      "description": "Detailed description of the discrepancy",
      "documents_involved": ["Document 1", "Document 2"],
      "severity": "high|medium|low",
      "field": "specific field name if applicable"
    }
  ],
  "summary": "Overall assessment of document consistency",
  "confidence": "high|medium|low",
  "recommendations": [
    "Specific recommendation for resolving discrepancies"
  ]
}

Focus on:
- Contradictory information between documents
- Missing information in some documents
- Inconsistent formatting or standards
- Data quality issues
- Potential fraud indicators`;

    console.log('🤖 Calling LLM for discrepancy analysis...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    try {
      const llmResponse = await fetch(`${config.ollama.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.ollama.model,
          prompt: discrepancyPrompt,
          stream: false,
        }),
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

      console.log('📄 Raw discrepancy analysis response:', {
        responseLength: result.response?.length || 0,
        responsePreview: result.response?.substring(0, 200) + '...',
      });

      // Try to parse the response as JSON
      let parsedAnalysis;
      try {
        console.log('🔍 Attempting to parse discrepancy analysis as JSON...');

        // Handle markdown code blocks
        let responseText = result.response;
        if (responseText.includes('```json')) {
          console.log('📊 Detected JSON code block format');
          responseText = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
        }

        parsedAnalysis = JSON.parse(responseText);
        console.log(
          '✅ Successfully parsed discrepancy analysis as JSON:',
          parsedAnalysis
        );
      } catch (parseError) {
        console.warn(
          '⚠️ Failed to parse discrepancy analysis as JSON:',
          parseError
        );
        // Fallback: create a basic structure from the raw response
        parsedAnalysis = {
          discrepancies: [],
          summary: 'Analysis completed but response format was unexpected',
          confidence: 'low',
          recommendations: ['Review the raw response for detailed analysis'],
          rawResponse: result.response,
        };
      }

      const responseData = {
        analysis: parsedAnalysis,
        documentsAnalyzed: documentSummaries.length,
        rawResponse: result.response,
      };

      console.log('📤 Sending discrepancy analysis response:', {
        discrepanciesFound: parsedAnalysis.discrepancies?.length || 0,
        documentsAnalyzed: documentSummaries.length,
      });

      return NextResponse.json(responseData);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('⏰ Discrepancy analysis timed out');
        throw new Error(
          'Discrepancy analysis timed out after 2 minutes. Please try again.'
        );
      }
      console.error('❌ Error during LLM call:', error);
      throw error;
    }
  } catch (error) {
    console.error('💥 Discrepancy analysis error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Discrepancy analysis failed',
      },
      { status: 500 }
    );
  }
}
