const DashboardModel = require('../models/dashboardModel');

const getDashboardStats = async (req, res) => {
  try {
    const data = await DashboardModel.getAdminStats();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy thống kê tổng quan',
      error: error.message
    });
  }
};

const getInstructorStats = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const data = await DashboardModel.getInstructorStats(instructorId);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching instructor stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy thống kê giảng viên',
      error: error.message
    });
  }
};

const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    const data = await DashboardModel.getStudentStats(studentId);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy thống kê học viên',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getInstructorStats,
  getStudentStats
};

