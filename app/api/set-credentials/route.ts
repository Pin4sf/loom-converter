import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Add Edge Runtime directive
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Configure CORS headers for the API route
export async function OPTIONS(request: Request) {
  const allowedOrigins = process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://127.0.0.1:41249', 'http://127.0.0.1:*']
    : [process.env.NEXT_PUBLIC_SITE_URL || ''];
  
  const origin = request.headers.get('origin') || '';
  const isAllowedOrigin = process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin);
  
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Set cookies with HTTP-only flag
    const cookieStore = cookies();
    cookieStore.set('anthropic-api-key', data.anthropicApiKey, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });
    
    cookieStore.set('openai-api-key', data.openaiApiKey, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });
    
    cookieStore.set('preferred-provider', data.preferredProvider, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });
    
    // Also set a non-HTTP-only flag cookie to indicate HTTP-only cookies are set
    cookieStore.set('hasApiConfig', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });
    
    // Set CORS headers for the response
    const origin = request.headers.get('origin') || '';
    const allowedOrigins = process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://127.0.0.1:41249', 'http://127.0.0.1:*']
      : [process.env.NEXT_PUBLIC_SITE_URL || ''];
    
    const isAllowedOrigin = process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin);
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error) {
    console.error('Error setting credentials:', error);
    return NextResponse.json({ success: false, error: 'Failed to set credentials' }, { status: 500 });
  }
}