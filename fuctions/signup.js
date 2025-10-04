import bcrypt from 'bcryptjs';

export async function onRequestPost({ request, env }) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Check if user already exists
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existing) {
      return new Response('Email already registered', { status: 409 });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Insert new user
    await env.DB.prepare(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
    )
    .bind(name, email, passwordHash)
    .run();

    return new Response(JSON.stringify({ success: true, message: 'User registered' }), {
      status: 201,
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    return new Response('Server error', { status: 500 });
  }
}
