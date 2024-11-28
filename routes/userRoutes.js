const express = require("express");
const router = express.Router();

const {
  authorizePermission,
  authenticateUser,
} = require("../middlewares/authentication");

const { getAllUsers } = require("../controllers/userController");

// /api/v1/user
router.get(
  "/getAllUsers",
  authenticateUser,
  authorizePermission("admin"),
  getAllUsers
);

module.exports = router;
