export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Hardcoded admin user
    if (email === 'admin@stolckr.com' && password === 'admin123') {
      const token = 'dummy-admin-token-' + Date.now();

      return Response.json({
        access_token: token,
        refresh_token: token,
        expires_in: 24 * 60 * 60,
        token_type: 'bearer'
      });
    }

    // Test user
    if (email === 'test@stolckr.com' && password === 'password123') {
      const token = 'dummy-test-token-' + Date.now();

      return Response.json({
        access_token: token,
        refresh_token: token,
        expires_in: 24 * 60 * 60,
        token_type: 'bearer'
      });
    }

    return Response.json({ error: 'Invalid email or password' }, { status: 401 });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}