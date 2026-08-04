import { NextRequest, NextResponse } from 'next/server';
import { processCallWithGemini, CallProcessorInput } from '@/lib/ai/call-processor';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  let callId: string | undefined;

  try {
    const body = await req.json();
    callId = body.callId;

    let audioBase64 = body.audioBase64;
    let audioMimeType = body.audioMimeType || 'audio/mp3';

    // If recordingUrl is provided but no audioBase64, attempt to fetch recording
    if (!audioBase64 && body.recordingUrl && body.recordingUrl.startsWith('http')) {
      try {
        const audioRes = await fetch(body.recordingUrl);
        if (audioRes.ok) {
          const buffer = await audioRes.arrayBuffer();
          audioBase64 = Buffer.from(buffer).toString('base64');
          const contentType = audioRes.headers.get('content-type');
          if (contentType) audioMimeType = contentType;
        }
      } catch (fetchErr) {
        console.warn('Could not fetch external audio recording URL, falling back to text analysis:', fetchErr);
      }
    }

    const processorInput: CallProcessorInput = {
      audioBase64,
      audioMimeType,
      transcriptText: body.transcriptText,
      contactName: body.contactName,
      companyName: body.companyName,
      callNotes: body.callNotes,
      callDirection: body.callDirection,
      agentName: body.agentName,
    };

    const aiResult = await processCallWithGemini(processorInput);

    // If callId provided, persist results into Supabase
    if (callId) {
      try {
        const supabase = await createServerClient();
        const updateData = {
          transcript: aiResult.transcript,
          short_summary: aiResult.short_summary,
          detailed_summary: aiResult.detailed_summary,
          sentiment: aiResult.sentiment,
          sentiment_reason: aiResult.sentiment_reason,
          intent: aiResult.intent,
          important_points: aiResult.important_points,
          objections: aiResult.objections,
          follow_up_tasks: aiResult.follow_up_tasks,
          suggested_action: aiResult.suggested_action,
          lead_score: aiResult.lead_score,
          generated_email: aiResult.generated_email,
          generated_whatsapp: aiResult.generated_whatsapp,
          processed_at: aiResult.processed_at,
          ai_status: 'completed',
          ai_error: null,
          summary: aiResult.short_summary,
        };

        const { error } = await supabase.from('calls').update(updateData).eq('id', callId);
        if (error) {
          console.error('Failed to update Supabase call record with AI results:', error);
        }
      } catch (dbErr) {
        console.error('Supabase update exception:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      callId,
      result: aiResult,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred during AI call processing.';
    console.error('AI Call Processing Error:', errorMessage);

    if (callId) {
      try {
        const supabase = await createServerClient();
        await supabase
          .from('calls')
          .update({
            ai_status: 'failed',
            ai_error: errorMessage,
          })
          .eq('id', callId);
      } catch {
        // Ignore secondary update error
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
