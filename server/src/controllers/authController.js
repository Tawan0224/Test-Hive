import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Register new user (email/password)
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'An account with this email already exists',
        },
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USERNAME_EXISTS',
          message: 'This username is already taken',
        },
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      username,
      displayName: username,
      authProvider: 'email',
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Signup error:', error.message, error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SIGNUP_FAILED',
        message: 'Failed to create account',
      },
    });
  }
};

// @desc    Login user (email/password)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Check if user signed up with OAuth
    if (user.authProvider !== 'email') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'OAUTH_ACCOUNT',
          message: `This account uses ${user.authProvider} login. Please sign in with ${user.authProvider}.`,
        },
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: 'Failed to log in',
      },
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('achievements.achievementId');
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch user data',
      },
    });
  }
};

// @desc    Handle Google OAuth callback
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { email, googleId, displayName, profilePicture } = req.body;

    // Check if user exists with this Google ID
    let user = await User.findOne({ authProviderId: googleId, authProvider: 'google' });

    if (!user) {
      // Check if email is already used with email/password
      const existingEmail = await User.findOne({ email, authProvider: 'email' });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'An account with this email already exists. Please log in with your password.',
          },
        });
      }

      // Generate unique username from display name
      const baseUsername = displayName.replace(/\s+/g, '').toLowerCase().slice(0, 20);
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Create new user
      user = await User.create({
        email,
        username,
        displayName,
        profilePicture,
        authProvider: 'google',
        authProviderId: googleId,
      });
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OAUTH_FAILED',
        message: 'Google authentication failed',
      },
    });
  }
};

// @desc    Handle Facebook OAuth callback
// @route   POST /api/auth/facebook
// @access  Public
export const facebookAuth = async (req, res) => {
  try {
    const { email, facebookId, displayName, profilePicture } = req.body;

    let user = await User.findOne({ authProviderId: facebookId, authProvider: 'facebook' });

    if (!user) {
      const existingEmail = await User.findOne({ email, authProvider: 'email' });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'An account with this email already exists. Please log in with your password.',
          },
        });
      }

      const baseUsername = displayName.replace(/\s+/g, '').toLowerCase().slice(0, 20);
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = await User.create({
        email,
        username,
        displayName,
        profilePicture,
        authProvider: 'facebook',
        authProviderId: facebookId,
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OAUTH_FAILED',
        message: 'Facebook authentication failed',
      },
    });
  }
};