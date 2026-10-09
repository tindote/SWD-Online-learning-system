const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_online_learning_2026_fa';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Password complexity regex: at least 8 chars, 1 uppercase, 1 lowercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory OTP storage for forgot password
// Map: normalizedEmail -> { otp: string, expiresAt: number }
const resetOtpStore = new Map();

const AuthController = {
  // Register new student account
  register: async (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body;

      // Validation
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập họ và tên'
        });
      }

      if (!email || !emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Địa chỉ email không hợp lệ'
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập mật khẩu'
        });
      }

      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu xác nhận không khớp'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check if email already registered
      const existingUser = await UserModel.getByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác'
        });
      }

      // Default role is always 'student' for public registration
      const newUser = await UserModel.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: 'student'
      });

      const token = generateToken(newUser);

      return res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công',
        token,
        user: newUser
      });
    } catch (error) {
      console.error('Registration Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi đăng ký tài khoản',
        error: error.message
      });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp đầy đủ email và mật khẩu'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await UserModel.getByEmailWithPassword(normalizedEmail);

      // Safe authentication rejection (no account enumeration)
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không chính xác'
        });
      }

      // Check password with bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không chính xác'
        });
      }

      const token = generateToken(user);

      // Return user without password
      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        created_at: user.created_at
      };

      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        token,
        user: safeUser
      });
    } catch (error) {
      console.error('Login Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi đăng nhập',
        error: error.message
      });
    }
  },

  // Get current user profile
  getMe: async (req, res) => {
    try {
      return res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tải thông tin tài khoản'
      });
    }
  },

  // Update profile
  updateProfile: async (req, res) => {
    try {
      const { name, avatar, bio } = req.body;

      if (name !== undefined && !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Họ và tên không được để trống'
        });
      }

      const updated = await UserModel.updateProfile(req.user.id, {
        name: name ? name.trim() : req.user.name,
        avatar: avatar !== undefined ? avatar : req.user.avatar,
        bio: bio !== undefined ? bio : req.user.bio
      });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin hồ sơ thành công',
        user: updated
      });
    } catch (error) {
      console.error('Profile Update Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật hồ sơ'
      });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới'
        });
      }

      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu xác nhận không khớp với mật khẩu mới'
        });
      }

      const userWithPw = await UserModel.getByEmailWithPassword(req.user.email);
      const isCurrentMatch = await bcrypt.compare(currentPassword, userWithPw.password);
      if (!isCurrentMatch) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu hiện tại không chính xác'
        });
      }

      await UserModel.updatePassword(req.user.id, newPassword);

      return res.status(200).json({
        success: true,
        message: 'Đổi mật khẩu thành công. Vui lòng ghi nhớ mật khẩu mới'
      });
    } catch (error) {
      console.error('Change Password Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi đổi mật khẩu'
      });
    }
  },

  // Forgot password - Request OTP
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || !emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập địa chỉ email hợp lệ'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await UserModel.getByEmail(normalizedEmail);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản nào liên kết với email này'
        });
      }

      // Generate 6-digit numeric OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

      resetOtpStore.set(normalizedEmail, { otp, expiresAt });

      console.log(`[PASSWORD_RESET_OTP] Email: ${normalizedEmail} | OTP: ${otp} | Expires: ${new Date(expiresAt).toISOString()}`);

      return res.status(200).json({
        success: true,
        message: 'Mã xác thực khôi phục mật khẩu đã được tạo thành công.',
        otp,
        email: normalizedEmail
      });
    } catch (error) {
      console.error('Forgot Password Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi gửi yêu cầu khôi phục mật khẩu',
        error: error.message
      });
    }
  },

  // Reset password with OTP
  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword, confirmPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp đầy đủ email, mã OTP và mật khẩu mới'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const storedData = resetOtpStore.get(normalizedEmail);

      if (!storedData) {
        return res.status(400).json({
          success: false,
          message: 'Chưa có yêu cầu mã xác thực hoặc mã đã hết hạn. Vui lòng gửi lại yêu cầu mới'
        });
      }

      if (Date.now() > storedData.expiresAt) {
        resetOtpStore.delete(normalizedEmail);
        return res.status(400).json({
          success: false,
          message: 'Mã xác thực OTP đã hết hạn. Vui lòng gửi lại yêu cầu mới'
        });
      }

      if (storedData.otp !== otp.toString().trim()) {
        return res.status(400).json({
          success: false,
          message: 'Mã xác thực OTP không chính xác. Vui lòng kiểm tra lại'
        });
      }

      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu xác nhận không khớp với mật khẩu mới'
        });
      }

      const user = await UserModel.getByEmail(normalizedEmail);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản người dùng'
        });
      }

      await UserModel.updatePassword(user.id, newPassword);

      // Invalidate the used OTP
      resetOtpStore.delete(normalizedEmail);

      return res.status(200).json({
        success: true,
        message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới'
      });
    } catch (error) {
      console.error('Reset Password Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi đặt lại mật khẩu',
        error: error.message
      });
    }
  }
};

module.exports = AuthController;
