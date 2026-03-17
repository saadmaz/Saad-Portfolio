import { Request, Response, NextFunction } from 'express';

/**
 * Authentication middleware for admin routes.
 * Uses Bearer token with the ADMIN_SECRET environment variable.
 * If ADMIN_SECRET is not set, all admin requests are rejected.
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    console.error('❌ ADMIN_SECRET environment variable is not set. Admin routes are disabled.');
    return res.status(503).json({
      success: false,
      error: 'Admin service unavailable: server misconfiguration.'
    });
  }

  const authHeader = req.headers.authorization;
  const expected = `Bearer ${adminSecret}`;

  if (!authHeader || authHeader !== expected) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized. Admin access required.' 
    });
  }

  next();
};
