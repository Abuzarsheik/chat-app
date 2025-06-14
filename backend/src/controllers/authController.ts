import { Response, NextFunction } from 'express';
import User from '../models/User';
import { JWTUtils } from '../utils/jwt';
import { sendResponse, AppError, asyncHandler } from '../middleware/errorHandler';
import { IAuthRequest, IRegisterData, ILoginData, ILoginResponse } from '../types';

/**
 * Register a new user
 */
export const register = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { username, email, password }: IRegisterData = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return next(new AppError('User with this email or username already exists', 400));
  }

  // Create new user
  const user = new User({
    username,
    email,
    password
  });

  await user.save();

  // Generate tokens
  const jwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    username: user.username
  };

  const { accessToken, refreshToken } = JWTUtils.generateTokens(jwtPayload);

  // Set user as online
  await user.setOnlineStatus(true);

  // Prepare response data
  const responseData: ILoginResponse = {
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      online: user.online
    },
    accessToken,
    refreshToken
  };

  sendResponse.success(res, responseData, 'User registered successfully', 201);
});

/**
 * Login user
 */
export const login = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password }: ILoginData = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Generate tokens
  const jwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    username: user.username
  };

  const { accessToken, refreshToken } = JWTUtils.generateTokens(jwtPayload);

  // Set user as online
  await user.setOnlineStatus(true);

  // Prepare response data
  const responseData: ILoginResponse = {
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      online: user.online
    },
    accessToken,
    refreshToken
  };

  sendResponse.success(res, responseData, 'Login successful');
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  // Set user as offline
  const user = await User.findById(req.user.userId);
  if (user) {
    await user.setOnlineStatus(false);
  }

  sendResponse.success(res, null, 'Logout successful');
});

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Invalid refresh token', 401));
  }

  // Verify user still exists
  const user = await User.findById(req.user.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Generate new tokens
  const jwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    username: user.username
  };

  const { accessToken, refreshToken: newRefreshToken } = JWTUtils.generateTokens(jwtPayload);

  // Update last seen
  await user.updateLastSeen();

  const responseData = {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      online: user.online
    }
  };

  sendResponse.success(res, responseData, 'Token refreshed successfully');
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const userProfile = {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    online: user.online,
    lastSeen: user.lastSeen,
    createdAt: user.createdAt
  };

  sendResponse.success(res, userProfile, 'Profile retrieved successfully');
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const { username, email } = req.body;
  const user = await User.findById(req.user.userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if username or email is already taken by another user
  if (username && username !== user.username) {
    const existingUser = await User.findOne({
      username,
      _id: { $ne: user._id }
    });
    if (existingUser) {
      return next(new AppError('Username already taken', 400));
    }
    user.username = username;
  }

  if (email && email !== user.email) {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: user._id }
    });
    if (existingUser) {
      return next(new AppError('Email already taken', 400));
    }
    user.email = email;
  }

  await user.save();

  const updatedProfile = {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    online: user.online,
    lastSeen: user.lastSeen,
    createdAt: user.createdAt
  };

  sendResponse.success(res, updatedProfile, 'Profile updated successfully');
});

/**
 * Change user password
 */
export const changePassword = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.userId).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendResponse.success(res, null, 'Password changed successfully');
}); 