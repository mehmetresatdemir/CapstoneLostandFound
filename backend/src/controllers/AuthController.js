const UserModel = require('../models/UserModel');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');

class AuthController {
  static async register(req, res, next) {
    try {
      const { firstName, lastName, email, phone, password } = req.body;

      const existingUser = await UserModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      const passwordHash = await hashPassword(password);

      const result = await UserModel.createUser({
        firstName,
        lastName,
        email,
        phone: phone || null,
        passwordHash
      });

      const token = generateToken(result.insertId);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          userId: result.insertId,
          email,
          firstName,
          lastName,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const passwordMatch = await comparePassword(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = generateToken(user.id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          userId: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const userId = req.userId;

      const user = await UserModel.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          userId: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          createdAt: user.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const userId = req.userId;
      const { firstName, lastName, phone } = req.body;

      await UserModel.updateUserProfile(userId, {
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || null
      });

      const updatedUser = await UserModel.getUserById(userId);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          userId: updatedUser.id,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          email: updatedUser.email,
          phone: updatedUser.phone
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
