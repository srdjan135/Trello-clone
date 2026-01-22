const User = require("../models/user");

exports.getUser = async (req, res) => {
  const userId = req.userData.userId;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found! " });
    }

    res.status(200).json({
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user!" });
  }
};
