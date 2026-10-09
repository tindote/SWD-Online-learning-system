const UserModel = require('../models/userModel');

const validateUserInput = (data) => {
  const errors = [];
  const { name, email, role } = data;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Họ và tên là bắt buộc');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('Địa chỉ email không hợp lệ');
  }

  const validRoles = ['student', 'instructor', 'admin'];
  if (role && !validRoles.includes(role.toLowerCase())) {
    errors.push(`Vai trò phải là một trong các giá trị: ${validRoles.join(', ')}`);
  }

  return errors;
};

const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const users = await UserModel.getAll({ role, search });
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải danh sách người dùng',
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.getById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy người dùng có ID ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy thông tin người dùng',
      error: error.message
    });
  }
};

const createUser = async (req, res) => {
  try {
    const errors = validateUserInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    const { name, email, role, password, bio, avatar } = req.body;
    const existingUser = await UserModel.getByEmail(email.trim());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `Email "${email}" đã tồn tại trên hệ thống`
      });
    }

    const newUser = await UserModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password || 'Password123!',
      role: role ? role.toLowerCase() : 'student',
      bio: bio || null,
      avatar: avatar || null
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản người dùng thành công',
      data: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tạo người dùng',
      error: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await UserModel.getById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy người dùng có ID ${id}`
      });
    }

    const errors = validateUserInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    const { name, email, role, bio, avatar } = req.body;
    
    // Check if email belongs to another user
    const userWithEmail = await UserModel.getByEmail(email.trim());
    if (userWithEmail && userWithEmail.id !== parseInt(id, 10)) {
      return res.status(409).json({
        success: false,
        message: `Email "${email}" đã được sử dụng bởi người dùng khác`
      });
    }

    // Safety: prevent demoting the last admin
    if (existingUser.role === 'admin' && role && role !== 'admin') {
      const adminCount = await UserModel.countAdmins();
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Không thể giáng chức quản trị viên duy nhất còn lại của hệ thống'
        });
      }
    }

    const updatedUser = await UserModel.update(id, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role ? role.toLowerCase() : existingUser.role,
      bio: bio !== undefined ? bio : existingUser.bio,
      avatar: avatar !== undefined ? avatar : existingUser.avatar
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin người dùng thành công',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật thông tin người dùng',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const targetId = parseInt(id, 10);

    const existingUser = await UserModel.getById(targetId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy người dùng có ID ${id}`
      });
    }

    // Prevent deleting oneself
    if (req.user && req.user.id === targetId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể tự xóa tài khoản đang đăng nhập của mình'
      });
    }

    // Safety: prevent deleting the last admin
    if (existingUser.role === 'admin') {
      const adminCount = await UserModel.countAdmins();
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa quản trị viên duy nhất còn lại của hệ thống'
        });
      }
    }

    await UserModel.delete(targetId);

    return res.status(200).json({
      success: true,
      message: `Đã xóa người dùng thành công`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa người dùng',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
