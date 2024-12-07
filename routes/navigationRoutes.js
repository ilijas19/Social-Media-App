const express = require("express");
const router = express.Router();
const path = require("path");

const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");

router.use(express.static(path.join(__dirname, "../public")));

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/login.html"));
});

router.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/register.html"));
});

router.get("/home", authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/home.html"));
});

router.get("/profile", authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/profile.html"));
});

router.get("/messages", authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/messages.html"));
});

router.get("/saved", authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/saved.html"));
});
router.get("/notifications", authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/notifications.html"));
});

router.get("/search", authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/search.html"));
});
module.exports = router;
