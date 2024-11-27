const express = require("express");
const router = express.Router();

const {
  registerUser,
  verifyUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
  getCurrentUser,
} = require("../controllers/authController");

const {
  authorizePermission,
  authenticateUser,
} = require("../middlewares/authentication");

router.post("/register", registerUser);
router.post("/verify-user", verifyUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/login", loginUser);
router.delete("/logout", authenticateUser, logoutUser);

router.get("/showMe", authenticateUser, getCurrentUser);

module.exports = router;
