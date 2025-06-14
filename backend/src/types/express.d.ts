import { Document } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: Document & {
        _id: string;
        username: string;
        email: string;
        avatar?: string;
        isOnline: boolean;
        lastSeen: Date;
        password: string;
        comparePassword(password: string): Promise<boolean>;
      };
    }
  }
}

export {}; 