const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];

      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // ❌ bỏ '|| abc123'

      // Lấy thông tin người dùng từ token
      req.user = await User.findById(decoded.id).select('-password');

      return next();
    } catch (error) {
      console.error('JWT error:', error.message); // log lỗi rõ ràng hơn
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
  }

  // Nếu không có token
  return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
};

// Middleware cho quyền Admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(401).json({ message: 'Chỉ admin mới được phép truy cập' });
  }
};

module.exports = { protect, admin };
