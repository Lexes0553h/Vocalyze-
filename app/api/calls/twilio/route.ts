import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, contactName, isTestMode } = body;

    const accountSid = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || body.accountSid || 'AC_TEST_ACCOUNT_SID';
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER || body.from || '+15550192834';

    if (!to) {
      return NextResponse.json({ error: 'Destination phone number is required.' }, { status: 400 });
    }

    // Check if live credentials are model-provided or if test mode is active
    if (!authToken || accountSid.startsWith('AC_TEST') || isTestMode) {
      const mockCallSid = `CA_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return NextResponse.json({
        success: true,
        mode: 'test',
        callSid: mockCallSid,
        to,
        from: fromNumber,
        status: 'queued',
        message: 'Call initiated in Twilio Test Mode.',
      });
    }

    // Live Twilio REST API integration
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('From', fromNumber);
    formData.append('Url', 'http://demo.twilio.com/docs/voice.xml'); // Default TwiML response

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({
        error: 'Twilio API Error',
        details: errText,
      }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      mode: 'live',
      callSid: data.sid,
      status: data.status,
      to: data.to,
      from: data.from,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Failed to initiate Twilio call.',
    }, { status: 500 });
  }
}
