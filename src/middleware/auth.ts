import { Request, Response, NextFunction } from 'express';
import { getAdminAuth, getAdminAppCheck } from '../../server/firebaseAdmin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { VerifyAppCheckTokenResponse } from 'firebase-admin/app-check';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  appCheck?: VerifyAppCheckTokenResponse;
}

export const requireAppCheck = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const appCheckToken = req.header('X-Firebase-AppCheck') || req.header('x-firebase-appcheck');
  if (!appCheckToken) {
    return next();
  }
  try {
    const adminAppCheck = getAdminAppCheck();
    if (!adminAppCheck) return next();
    const claims = await adminAppCheck.verifyToken(appCheckToken);
    (req as any).appCheck = claims;
    return next();
  } catch (err: any) {
    console.warn('[App Check] Token verification notice:', err?.message || err);
    return next();
  }
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      // Fallback if Firebase Admin is not fully initialized with credentials in some modes
      return next();
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
