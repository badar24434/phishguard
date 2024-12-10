import { NextResponse } from 'next/server';
import { runInference } from '@/lib/model.server';
import { ScanResult } from '@/lib/phishing-detection';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required.' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format.' },
        { status: 400 }
      );
    }

    const results = await runInference(url);
    
    const result: ScanResult = {
      url,
      timestamp: new Date().toISOString(),
      isPhishing: results.isPhishing,
      confidence: results.confidence
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Scan error:', error);
    
    return NextResponse.json(
      {
        url: url || '',
        timestamp: new Date().toISOString(),
        isPhishing: false,
        confidence: 0,
        error: error.message || 'Failed to analyze URL.'
      },
      { status: 500 }
    );
  }
}