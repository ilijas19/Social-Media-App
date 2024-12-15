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
  searchForUser,
  getFollowRequests,
  getUserFollowers,
  getUserFollowing,
  acceptFollowRequest,
  declineFollowRequest,
  followUnfollowUser,
} = require("../controllers/userController");

// /api/v1/user
router.get(
  "/getAllUsers",
  authenticateUser,
  authorizePermission("admin"),
  getAllUsers
);

router.post("/search", authenticateUser, searchForUser);
router.get("/requests", authenticateUser, getFollowRequests);

router.post("/accept", authenticateUser, acceptFollowRequest);
router.delete("/decline", authenticateUser, declineFollowRequest);

router.get("/followers/:username", authenticateUser, getUserFollowers);
router.get("/following/:username", authenticateUser, getUserFollowing);

router.get("/followUnfollow/:username", authenticateUser, followUnfollowUser);

router
  .route("/:id")
  .get(authenticateUser, authorizePermission("admin"), getSingleUser)
  .delete(authenticateUser, authorizePermission("admin"), deleteUser);

module.exports = router;
