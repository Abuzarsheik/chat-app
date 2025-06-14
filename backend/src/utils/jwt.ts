import jwt, { SignOptions } from 'jsonwebtoken';
import { IJWTPayload } from '../types';

export class JWTUtils {
  private static getSecret(type: 'access' | 'refresh' = 'access'): string {
    const secret = type === 'access' 
      ? process.env.JWT_SECRET 
      : process.env.JWT_REFRESH_SECRET;
    
    if (!secret) {
      throw new Error(`JWT ${type} secret is not defined in environment variables`);
    }
    
    return secret;
  }

  private static getExpiration(type: 'access' | 'refresh' = 'access'): string {
    return type === 'access' 
      ? process.env.JWT_EXPIRE || '15m'
      : process.env.JWT_REFRESH_EXPIRE || '7d';
  }

  /**
   * Generate access token
   */
  static generateAccessToken(payload: IJWTPayload): string {
    try {
      return jwt.sign(
        payload,
        this.getSecret('access'),
        { 
          expiresIn: this.getExpiration('access'),
          issuer: 'chat-app',
          subject: payload.userId
        } as any
      );
    } catch (error) {
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: IJWTPayload): string {
    try {
      return jwt.sign(
        payload,
        this.getSecret('refresh'),
        { 
          expiresIn: this.getExpiration('refresh'),
          issuer: 'chat-app',
          subject: payload.userId
        } as any
      );
    } catch (error) {
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokens(payload: IJWTPayload): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): IJWTPayload {
    try {
      const decoded = jwt.verify(token, this.getSecret('access')) as IJWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): IJWTPayload {
    try {
      const decoded = jwt.verify(token, this.getSecret('refresh')) as IJWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error('Failed to decode token');
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    return expiration.getTime() < Date.now();
  }
} 