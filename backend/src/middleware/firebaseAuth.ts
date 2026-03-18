import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

/**
 * Middleware to verify Firebase ID tokens.
 * Expects 'Authorization: Bearer <token>' header.
 */
export const firebaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. No token provided.'
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Add the user data to the request object for use in controllers
    (req as any).user = decodedToken;
    
    next();
  } catch (error: any) {
    console.error('❌ Error verifying Firebase ID token:', error.message);
    
    let errorMessage = 'Unauthorized. Invalid token.';
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Unauthorized. Token expired.';
    } else if (error.code === 'auth/argument-error') {
      errorMessage = 'Unauthorized. Malformed token.';
    }

    return res.status(401).json({
      success: false,
      error: errorMessage
    });
  }
};
