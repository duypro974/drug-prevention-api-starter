const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token không hợp lệ hoặc không tồn tại" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // gán user đã decode vào req
    next();
  } catch (err) {
    return res.status(403).json({ message: "Xác thực thất bại", error: err.message });
  }
};

module.exports = authenticate;
