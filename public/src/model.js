export const state = {
  currentUser: {},
  explorePage: 1,
  followingPage: 1,
  savedPage: 1,
  ownPostsPage: 1,
  likedPage: 1,
  searchedUserPostPAge: 1,
};

export const loginUser = async (email, password) => {
  try {
    const result = await axios.post("/api/v1/auth/login", { email, password });
    alert(result.data.msg);
    window.location = "/home";
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const result = await axios.post("/api/v1/auth/register", {
      username,
      email,
      password,
    });

    if (result) {
      alert("Registration Successful");
      window.location = "/login";
    }
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const getCurrentUser = async () => {
  try {
    const result = await axios.get("/api/v1/auth/showMe");
    return result.data.currentUser;
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const getExploreSectionPosts = async () => {
  try {
    const result = await axios.get(
      `/api/v1/post/explore?page=${state.explorePage}`
    );
    state.followingPage = 1;
    state.explorePage += 1;
    return result.data.postsWithUserData;
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const getFollowingSectionPosts = async () => {
  try {
    const result = await axios.get(
      `/api/v1/post/following?page=${state.followingPage}`
    );
    state.explorePage = 1;
    state.followingPage += 1;

    return result.data.postsWithUserData;
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const getSavedPosts = async () => {
  try {
    const result = await axios.get(
      `/api/v1/post/savedPosts?page=${state.savedPage}`
    );
    state.savedPage += 1;
    return result.data.postsWithUserData;
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const getLikedPosts = async () => {
  try {
    const result = await axios.get(
      `/api/v1/post/likedPosts?page=${state.likedPage}`
    );
    state.likedPage += 1;
    return result.data.postsWithUserData;
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const getOwnPosts = async () => {
  try {
    const result = await axios.get(`/api/v1/post?page=${state.ownPostsPage}`);
    state.ownPostsPage += 1;
    return result.data.postsWithUserData;
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const saveUnsavePost = async (postId) => {
  try {
    const result = await axios.get(`/api/v1/post/${postId}/save`);
  } catch (error) {
    alert(error.response.data.msg);
    window.location.reload();
  }
};

export const likeUnlikePost = async (postId) => {
  try {
    const result = await axios.get(`/api/v1/post/${postId}/like-unlike`);
    console.log(result.data.msg);
  } catch (error) {
    alert(error.response.data.msg);
    window.location.reload();
  }
};

export const getSinglePost = async (postId) => {
  try {
    const result = await axios.get(`/api/v1/post/${postId}`);
    // console.log(result.data.post);
    return result.data.post;
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const createComment = async (postId, text) => {
  try {
    const result = await axios.post(`/api/v1/comment/${postId}`, { text });
    console.log(result.data);
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const deleteComment = async (commentId) => {
  try {
    const result = await axios.delete(`/api/v1/comment/${commentId}`);
    console.log(result.data.msg);
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const createPost = async (text, imageFile) => {
  try {
    const formData = new FormData(); // To handle the file upload
    formData.append("text", text);
    formData.append("image", imageFile);

    const result = await axios.post("/api/v1/post", formData);

    console.log("Post created:");
    return result.data.post;
  } catch (error) {
    alert(
      error.response?.data?.msg || "An error occurred while creating the post."
    );
  }
};

export const deletePost = async (postId) => {
  try {
    const result = await axios.delete(`/api/v1/post/${postId}`);
    console.log(result.data.msg);
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const searchForUser = async (username) => {
  try {
    const response = await axios.post(
      `/api/v1/user/search?username=${username}`
    );
    // console.log(response.data.users);
    return response.data.users;
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const getUserProfile = async (username) => {
  try {
    const result = await axios.get(`/api/v1/profile/${username}`);
    return result.data.user;
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const getUserProfilePosts = async (username) => {
  try {
    const result = await axios.get(
      `/api/v1/profile/profilePosts/${username}?page=${state.searchedUserPostPAge}`
    );
    state.searchedUserPostPAge += 1;
    // console.log(result.data.postsWithUserData);
    return result.data.postsWithUserData;
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const getUserFollowing = async (username) => {
  try {
    const result = await axios.get(`/api/v1/user/following/${username}`);
    // console.log(result.data.following);
    return result.data.following;
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const getUserFollowers = async (username) => {
  try {
    const result = await axios.get(`/api/v1/user/followers/${username}`);
    // console.log(result.data.followers);
    return result.data.followers;
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const followUnfollowUser = async (username) => {
  try {
    const response = await axios.get(`/api/v1/user/followUnfollow/${username}`);
    return response.data.msg;
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const updateBio = async (bio) => {
  try {
    const response = await axios.patch("/api/v1/profile/bio", { bio });
    console.log(response.data);
  } catch (error) {
    alert(error.response.data.msg);
  }
};

export const updateProfilePicture = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    const response = await axios.patch(
      "/api/v1/profile/profilePhoto",
      formData
    );
    console.log(response.data);
  } catch (error) {
    alert(
      error.response.data.msg ||
        "An Error occured while updating the profile picture"
    );
  }
};
