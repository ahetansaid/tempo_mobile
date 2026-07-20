// Monte tous les endpoints Better Auth (sign-up, sign-in, session, sign-out…)
// sous /api/auth/*. Sert le web (cookie) ET Flutter (bearer).
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
