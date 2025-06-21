import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { documents } = await request.json();

    if (!documents?.length) {
      return NextResponse.json(
        { error: 'No documents provided' },
        { status: 400 }
      );
    }

    const prompt = `Analyze these documents for discrepancies. Respond with "yes" or "no":

${JSON.stringify(documents, null, 2)}`;

    const response = await fetch(`${config.ollama.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollama.model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const result = await response.json();
    const hasDiscrepancies = result.response.toLowerCase().includes('yes');

    return NextResponse.json({
      hasDiscrepancies,
      response: result.response,
    });
  } catch (error) {
    console.error('Discrepancy analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

// // Create a comprehensive prompt for discrepancy analysis
// const discrepancyPrompt = `Analyze the following documents and identify any discrepancies, inconsistencies, or contradictions between them.

// Documents to analyze:
// ${documentSummaries
//   .map(doc =>
//     doc
//       ? `
// Document ${doc.id}: ${doc.name} (${doc.type})
// Summary: ${doc.summary}
// Key Fields: ${JSON.stringify(doc.keyFields, null, 2)}
// `
//       : ''
//   )
//   .join('\n')}

// Please provide your analysis in the following JSON format:
// {
//   "discrepancies": [
//     {
//       "type": "contradiction|inconsistency|missing_info|format_mismatch",
//       "description": "Detailed description of the discrepancy",
//       "documents_involved": ["Document 1", "Document 2"],
//       "severity": "high|medium|low",
//       "field": "specific field name if applicable"
//     }
//   ],
//   "summary": "Overall assessment of document consistency",
//   "confidence": "high|medium|low",
//   "recommendations": [
//     "Specific recommendation for resolving discrepancies"
//   ]
// }

// Focus on:
// - Contradictory information between documents
// - Missing information in some documents
// - Inconsistent formatting or standards
// - Data quality issues
// - Potential fraud indicators`;
