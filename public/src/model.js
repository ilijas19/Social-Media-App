export const state = {
  currentUser: {},
  explorePage: 1,
  followingPage: 1,
  savedPage: 1,
  ownPostsPage: 1,
  likedPage: 1,
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
