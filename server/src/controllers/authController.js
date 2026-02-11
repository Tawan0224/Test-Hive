import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Register new user (email/password)
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { email, password, username } = req.body;

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

    const user = await User.create({
      email,
      password,
      username,
      displayName: username,
      authProvider: 'email',
    });

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

    if (user.authProvider !== 'email') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'OAUTH_ACCOUNT',
          message: `This account uses ${user.authProvider} login. Please sign in with ${user.authProvider}.`,
        },
      });
    }

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

    user.lastLogin = new Date();
    await user.save();

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
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    if (user.achievements && user.achievements.length > 0) {
      await user.populate('achievements.achievementId');
    }

    res.json({
      success: true,
      data: { user: user.toJSON() },
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

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { displayName, username, email } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!displayName || !displayName.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Display name is required',
        },
      });
    }

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username is required',
        },
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username must be at least 3 characters',
        },
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username can only contain letters, numbers, and underscores',
        },
      });
    }

    // Check if username is taken by another user
    const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USERNAME_EXISTS',
          message: 'This username is already taken',
        },
      });
    }

    // Check if email is taken by another user
    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'This email is already in use',
          },
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        displayName: displayName.trim(),
        username: username.trim(),
        ...(email && { email: email.trim().toLowerCase() }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data: { user: updatedUser.toJSON() },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update profile',
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

    let user = await User.findOne({ authProviderId: googleId, authProvider: 'google' });

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
        authProvider: 'google',
        authProviderId: googleId,
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