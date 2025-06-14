import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types';
import { JWTUtils } from '../utils/jwt';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    // Verify the token
    const decoded = JWTUtils.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    let message = 'Invalid or expired token';
    let statusCode = 401;
    
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        message = 'Access token has expired';
        statusCode = 401;
      } else if (error.message.includes('invalid')) {
        message = 'Invalid access token';
        statusCode = 401;
      }
    }

    res.status(statusCode).json({
      success: false,
      message,
      error: 'TOKEN_VERIFICATION_FAILED'
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = JWTUtils.verifyAccessToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

/**
 * Middleware to verify refresh token
 */
export const verifyRefreshToken = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token is required',
        error: 'MISSING_REFRESH_TOKEN'
      });
      return;
    }

    const decoded = JWTUtils.verifyRefreshToken(refreshToken);
    req.user = decoded;
    next();
  } catch (error) {
    let message = 'Invalid or expired refresh token';
    
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        message = 'Refresh token has expired';
      } else if (error.message.includes('invalid')) {
        message = 'Invalid refresh token';
      }
    }

    res.status(401).json({
      success: false,
      message,
      error: 'REFRESH_TOKEN_VERIFICATION_FAILED'
    });
  }
};

/**
 * Middleware to check if user owns the resource
 */
export const requireOwnership = (resourceUserIdField = 'userId') => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }

      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
      
      if (!resourceUserId) {
        res.status(400).json({
          success: false,
          message: `${resourceUserIdField} is required`,
          error: 'MISSING_RESOURCE_ID'
        });
        return;
      }

      if (req.user.userId !== resourceUserId) {
        res.status(403).json({
          success: false,
          message: 'Access denied: You can only access your own resources',
          error: 'ACCESS_DENIED'
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error during ownership verification',
        error: 'OWNERSHIP_VERIFICATION_ERROR'
      });
    }
  };
}; 