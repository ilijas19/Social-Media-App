const express = require("express");
const router = express.Router();
const {
  authorizePermission,
  authenticateUser,
} = require("../middlewares/authentication");

// /api/v1/posts
const {
  createPost, // post '/'
  editPost, // patch '/'
  deletePost, // delete '/'
  getOwnPosts, //get '/'
  getFollowingUsersPosts, //get '/following'
  getExploreSectionPosts, //get '/explore'
  getSinglePost, // get /:id
  getPostComments, // get '/:id/comments'
  getPostLikes, // get '/:id/likes'
  savePost, //get '/:id/save'
  getSavedPosts, // get '/savedPosts'
  likeUnlikePost, // get "/:id/like"
} = require("../controllers/postController");

router
  .route("/")
  .post(authenticateUser, createPost)
  .get(authenticateUser, getOwnPosts);

router.get("/following", authenticateUser, getFollowingUsersPosts);
router.get("/explore", authenticateUser, getExploreSectionPosts);
router.get("/savedPosts", authenticateUser, getSavedPosts);

router
  .route("/:id")
  .get(authenticateUser, getSinglePost)
  .patch(authenticateUser, editPost)
  .delete(authenticateUser, deletePost);

router.get("/:id/comments", authenticateUser, getPostComments);
router.get("/:id/likes", authenticateUser, getPostLikes);
router.get("/:id/save", authenticateUser, savePost);
router.get("/:id/like-unlike", authenticateUser, likeUnlikePost);

module.exports = router;
