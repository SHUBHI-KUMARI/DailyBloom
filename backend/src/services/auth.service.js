import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Generate access token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt
    }
  });

  return token;
};

/**
 * Hash password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password
 */
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Register new user with email and password
 */
export const registerUser = async ({ email, password, name }) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      emailVerified: true,
      createdAt: true
    }
  });

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  return {
    user,
    accessToken,
    refreshToken
  };
};

/**
 * Login user with email and password
 */
export const loginUser = async ({ email, password }) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if user has password (not Google OAuth user)
  if (!user.password) {
    throw new ApiError(401, 'Please login with Google');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    },
    accessToken,
    refreshToken
  };
};

/**
 * Login or register user with Google OAuth
 */
export const googleAuth = async ({ googleId, email, name, avatar }) => {
  // Find existing user by googleId or email
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { googleId },
        { email }
      ]
    }
  });

  if (user) {
    // Update user with Google info if not already linked
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          avatar: avatar || user.avatar,
          emailVerified: true
        }
      });
    }
  } else {
    // Create new user
    user = await prisma.user.create({
      data: {
        email,
        googleId,
        name,
        avatar,
        emailVerified: true
      }
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    },
    accessToken,
    refreshToken
  };
};

/**
 * Verify Google ID token
 */
export const verifyGoogleToken = async (idToken) => {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    if (!response.ok) {
      throw new ApiError(401, 'Invalid Google token');
    }

    const payload = await response.json();

    // Verify the token is for our app
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw new ApiError(401, 'Token not intended for this app');
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Failed to verify Google token');
  }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  // Find refresh token
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  });

  if (!storedToken) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Check if token is expired
  if (new Date() > storedToken.expiresAt) {
    // Delete expired token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id }
    });
    throw new ApiError(401, 'Refresh token expired');
  }

  // Generate new access token
  const accessToken = generateAccessToken(storedToken.userId);

  return {
    accessToken,
    user: {
      id: storedToken.user.id,
      email: storedToken.user.email,
      name: storedToken.user.name,
      avatar: storedToken.user.avatar,
      emailVerified: storedToken.user.emailVerified,
      createdAt: storedToken.user.createdAt
    }
  };
};

/**
 * Logout user - revoke refresh token
 */
export const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });
  }
};

/**
 * Logout from all devices - revoke all refresh tokens
 */
export const logoutAllDevices = async (userId) => {
  await prisma.refreshToken.deleteMany({
    where: { userId }
  });
};

/**
 * Update user profile
 */
export const updateProfile = async (userId, { name, avatar }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(avatar !== undefined && { avatar })
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      emailVerified: true,
      createdAt: true
    }
  });

  return user;
};

/**
 * Change password
 */
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user.password) {
    throw new ApiError(400, 'Cannot change password for Google OAuth account');
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  // Invalidate all refresh tokens for security
  await logoutAllDevices(userId);

  return { message: 'Password changed successfully' };
};
