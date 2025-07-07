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
      const url = new URL(request.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      
      if (!code) {
        return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
      }
      
      try {
        // Exchange authorization code for tokens
        const tokenResponse = await fetch(`https://${process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '')}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.AUTH0_CLIENT_ID!,
            client_secret: process.env.AUTH0_CLIENT_SECRET!,
            code: code,
            redirect_uri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
          }),
        });
        
        if (!tokenResponse.ok) {
          throw new Error('Token exchange failed');
        }
        
        const tokens = await tokenResponse.json();
        
        // Get user info
        const userResponse = await fetch(`https://${process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '')}/userinfo`, {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        });
        
        if (!userResponse.ok) {
          throw new Error('Failed to get user info');
        }
        
        const userInfo = await userResponse.json();
        
        // Create a simple session (in production, use proper session management)
        const response = NextResponse.redirect(process.env.AUTH0_BASE_URL!);
        
        // Set session cookie with user info
        response.cookies.set('appSession', JSON.stringify({
          user: userInfo,
          accessToken: tokens.access_token,
          idToken: tokens.id_token,
          expiresAt: Date.now() + (tokens.expires_in * 1000),
        }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: tokens.expires_in,
        });
        
        return response;
        
      } catch (error) {
        console.error('Auth0 callback error:', error);
        return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}?error=callback_error`);
      }
      
    case 'me':
      // Return user profile from session
      const sessionCookie = request.cookies.get('appSession');
      
      if (!sessionCookie) {
        return NextResponse.json({ error: 'No session found' }, { status: 401 });
      }
      
      try {
        const session = JSON.parse(sessionCookie.value);
        
        // Check if session is expired
        if (Date.now() > session.expiresAt) {
          return NextResponse.json({ error: 'Session expired' }, { status: 401 });
        }
        
        return NextResponse.json({ user: session.user });
      } catch (error) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }
      
    default:
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  }
} 