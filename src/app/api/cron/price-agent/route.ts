// Price Agent Cron API Route
// Runs daily to check prices automatically
// Requires secret key verification

import { NextResponse } from 'next/server';

// Cron secret key - should be set in environment variables
// In production: process.env.CRON_SECRET
const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret-key';

// Price Agent Cron API Route
// Runs daily at 6am UTC
// Requires secret key verification via x-cron-secret header

export async function GET(request: Request) {
  // Verify cron secret
  const cronSecret = request.headers.get('x-cron-secret');
  
  if (!cronSecret || cronSecret !== CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid cron secret' },
      { status: 401 }
    );
  }
  
  try {
    console.log('[Cron] Starting scheduled price agent run');
    
    // Call the price agent run endpoint
    const response = await fetch(new URL('/api/price-agent/run', request.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Price agent run failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('[Cron] Price agent run completed:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Scheduled price check completed',
      run: result.run,
    });
    
  } catch (error) {
    console.error('[Cron] Price agent cron failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also accept POST for manual triggering with secret
export async function POST(request: Request) {
  const cronSecret = request.headers.get('x-cron-secret');
  
  if (!cronSecret || cronSecret !== CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid cron secret' },
      { status: 401 }
    );
  }
  
  // Same logic as GET for POST requests
  return GET(request);
}