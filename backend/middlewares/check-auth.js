const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeaeder = req.headers.authorization;

    const token = authHeaeder.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    req.userData = {
      email: decodedToken.email,
      userId: decodedToken.userId,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token!" });
  }
};
