import bcrypt from 'bcryptjs';

export async function onRequestPost({ request, env }) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response('Missing email or password', { status: 400 });
    }

    // Lookup user by email
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (!user) {
      return new Response('Invalid email or password', { status: 401 });
    }

    // Verify password
    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return new Response('Invalid email or password', { status: 401 });
    }

    // Create a session token, store it in sessions table (not implemented here)
    // For simplicity, return user info without password
    const { password_hash, ...userWithoutPassword } = user;

    return new Response(JSON.stringify({ success: true, user: userWithoutPassword }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    return new Response('Server error', { status: 500 });
  }
}
