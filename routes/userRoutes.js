const express = require("express");
const router = express.Router();

const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");

const {
  getAllUsers,
  getSingleUser,
  deleteUser,
  followUser,
  unfollowUser,
  searchForUser,
  getFollowers,
  getFollowing,
  getFollowRequests,
} = require("../controllers/userController");

// /api/v1/user
router.get(
  "/getAllUsers",
  authenticateUser,
  authorizePermission("admin"),
  getAllUsers
);

router.post("/search", authenticateUser, searchForUser);
router.get("/followers", authenticateUser, getFollowers);
router.get("/following", authenticateUser, getFollowing);
router.get("/requests", authenticateUser, getFollowRequests);

router.post("/:username/follow", authenticateUser, followUser);
router.post("/:username/unfollow", authenticateUser, unfollowUser);

router
  .route("/:id")
  .get(authenticateUser, authorizePermission("admin"), getSingleUser)
  .delete(authenticateUser, authorizePermission("admin"), deleteUser);

module.exports = router;
