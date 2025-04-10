import jwt from 'jsonwebtoken';
import { Request } from 'express';

const secret = 'your_jwt_secret'; // Replace with your actual secret or use an environment variable
const expiration = '2h';

// Function to sign a JWT token with user data
export function signToken({ username, email, _id }: { username: string; email: string; _id: string }) {
  const payload = { username, email, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
}

// Apollo-compatible authentication middleware for context
export function authMiddleware({ req }: { req: Request }) {
  // Token might be in the header
  let token = req.headers.authorization || '';

  // If token is sent as "Bearer <token>", remove "Bearer "
  if (token.startsWith('Bearer ')) {
    token = token.split(' ').pop()?.trim() || '';
  }

  if (!token) {
    return { user: null };
  }

  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration }) as any;
    return { user: data };
  } catch (err) {
    console.error('Invalid token', err);
    return { user: null };
  }
}
