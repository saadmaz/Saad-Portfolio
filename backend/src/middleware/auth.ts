import { Request, Response, NextFunction } from 'express';

/**
 * Basic authentication middleware for admin routes.
 * Uses Bearer token with the ADMIN_SECRET environment variable.
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET || 'adminpassword';
  const expected = `Bearer ${adminSecret}`;

  if (!authHeader || authHeader !== expected) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized. Admin access required.' 
    });
  }

  next();
};
