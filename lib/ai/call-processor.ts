import { GoogleGenAI, Type } from '@google/genai';

export interface ProcessedCallResult {
  transcript: string;
  short_summary: string;
  detailed_summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentiment_reason: string;
  intent: string;
  important_points: string[];
  objections: string[];
  follow_up_tasks: string[];
  suggested_action: string;
  lead_score: number;
  generated_email: string;
  generated_whatsapp: string;
  processed_at: string;
}

export interface CallProcessorInput {
  audioBase64?: string;
  audioMimeType?: string;
  transcriptText?: string;
  contactName?: string;
  companyName?: string;
  callNotes?: string;
  callDirection?: string;
  agentName?: string;
}

export async function processCallWithGemini(input: CallProcessorInput): Promise<ProcessedCallResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const contact = input.contactName || 'Customer';
  const company = input.companyName || 'Vocalyze CRM';
  const agent = input.agentName || 'Sales Representative';
  const direction = input.callDirection || 'outbound';

  const promptText = `
You are an expert enterprise CRM AI analyst for "${company}".
Analyze the provided phone call between agent "${agent}" and customer "${contact}".

Required Tasks:
1. Generate an accurate verbatim or realistic call transcript if processing audio. If text notes are provided, flesh them out into a natural conversation transcript.
2. Provide a short 1-2 sentence summary.
3. Provide a detailed summary broken into conversation stages.
4. Detect customer sentiment ('Positive', 'Neutral', or 'Negative') and explain the reason.
5. Identify customer intent (e.g., "Inquiring about enterprise pricing and implementation timeline").
6. List important discussion points (3-5 items).
7. List any objections or concerns raised by the customer (e.g., budget constraints, existing vendor, feature gaps).
8. List clear follow-up tasks for the sales rep.
9. Suggest the single best immediate next action.
10. Calculate a Lead Score (0 to 100) based on buying signals, budget, authority, urgency, and sentiment.
11. Write a professional, personalized follow-up email ready to be sent to ${contact}. Include Subject line.
12. Write a concise, engaging WhatsApp follow-up message with relevant emojis and a clear call-to-action.
`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      transcript: { type: Type.STRING, description: 'Full verbatim or formatted call transcript.' },
      short_summary: { type: Type.STRING, description: '1-2 sentence concise executive call summary.' },
      detailed_summary: { type: Type.STRING, description: 'Comprehensive call summary with context and outcome.' },
      sentiment: { type: Type.STRING, description: 'Positive, Neutral, or Negative' },
      sentiment_reason: { type: Type.STRING, description: 'Brief reasoning for the sentiment score.' },
      intent: { type: Type.STRING, description: 'Primary customer intent or goal.' },
      important_points: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Key discussion points during the call.',
      },
      objections: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Customer objections or concerns raised.',
      },
      follow_up_tasks: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Actionable follow-up tasks for the sales rep.',
      },
      suggested_action: { type: Type.STRING, description: 'Recommended immediate next action.' },
      lead_score: { type: Type.INTEGER, description: 'Lead quality score from 0 to 100.' },
      generated_email: { type: Type.STRING, description: 'Complete AI-generated follow-up email draft with Subject.' },
      generated_whatsapp: { type: Type.STRING, description: 'Conversational WhatsApp message draft with emojis.' },
    },
    required: [
      'transcript',
      'short_summary',
      'detailed_summary',
      'sentiment',
      'sentiment_reason',
      'intent',
      'important_points',
      'objections',
      'follow_up_tasks',
      'suggested_action',
      'lead_score',
      'generated_email',
      'generated_whatsapp',
    ],
  };

  // Build content parts
  const contentsParts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];

  if (input.audioBase64) {
    contentsParts.push({
      inlineData: {
        data: input.audioBase64,
        mimeType: input.audioMimeType || 'audio/mp3',
      },
    });
  }

  const textContext = `
Contact: ${contact}
Company: ${company}
Call Direction: ${direction}
Notes / Context: ${input.transcriptText || input.callNotes || 'Phone conversation regarding product demo, feature evaluation, and potential partnership.'}
  `;

  contentsParts.push({ text: promptText + '\n\n' + textContext });

  // Retry mechanism for AI processing resilience
  let retries = 2;
  let lastError: unknown = null;

  while (retries >= 0) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: { parts: contentsParts },
        config: {
          systemInstruction: 'You are an advanced AI call transcription and sales intelligence assistant. Provide precise, actionable CRM insights.',
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        throw new Error('Gemini returned an empty response.');
      }

      const parsed = JSON.parse(responseText) as ProcessedCallResult;
      return {
        ...parsed,
        sentiment: (['Positive', 'Neutral', 'Negative'].includes(parsed.sentiment) ? parsed.sentiment : 'Neutral') as 'Positive' | 'Neutral' | 'Negative',
        lead_score: Math.min(100, Math.max(0, parsed.lead_score || 50)),
        processed_at: new Date().toISOString(),
      };
    } catch (err: unknown) {
      lastError = err;
      retries--;
      if (retries >= 0) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }

  throw lastError || new Error('Failed to process call with Gemini API after retries.');
}
