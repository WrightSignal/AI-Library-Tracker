import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auth0: string[] }> }
) {
  const { auth0 } = await params;
  const route = auth0[0];
  
  switch (route) {
    case 'login':
      // Redirect to Auth0 login
      const loginUrl = new URL(`https://${process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '')}/authorize`);
      loginUrl.searchParams.set('response_type', 'code');
      loginUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
      loginUrl.searchParams.set('redirect_uri', `${process.env.AUTH0_BASE_URL}/api/auth/callback`);
      loginUrl.searchParams.set('scope', 'openid profile email');
      
      return NextResponse.redirect(loginUrl.toString());
      
    case 'logout':
      // Redirect to Auth0 logout
      const logoutUrl = new URL(`https://${process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '')}/v2/logout`);
      logoutUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
      logoutUrl.searchParams.set('returnTo', process.env.AUTH0_BASE_URL!);
      
      const response = NextResponse.redirect(logoutUrl.toString());
      // Clear session cookie
      response.cookies.delete('appSession');
      
      return response;
      
    case 'callback':
      // Handle Auth0 callback
      return NextResponse.json({ message: 'Callback endpoint - implement token exchange' });
      
    case 'me':
      // Return user profile
      return NextResponse.json({ message: 'Profile endpoint - implement user session retrieval' });
      
    default:
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  }
} 