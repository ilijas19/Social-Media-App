const express = require("express");
const router = express();

const {
  authorizePermission,
  authenticateUser,
} = require("../middlewares/authentication");

// /api/v1/profile
const {
  changeProfilePrivacy, // '/privacy'
  getOwnProfile, //  '/'
  getUserProfile, // '/:id'
  deleteProfile, // '/'
  updateProfilePicture, // '/profilePhoto'

  updateBio, // '/bio'
} = require("../controllers/profileController");

router
  .route("/")
  .get(authenticateUser, getOwnProfile)
  .delete(authenticateUser, deleteProfile);

router.post("/privacy", authenticateUser, changeProfilePrivacy);
router.patch("/profilePhoto", authenticateUser, updateProfilePicture);
router.patch("/bio", authenticateUser, updateBio);
router.route("/:name").get(authenticateUser, getUserProfile);

module.exports = router;
