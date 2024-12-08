export const state = {
  currentUser: {},
  explorePage: 1,
  followingPage: 1,
};

export const loginUser = async (email, password) => {
  try {
    const result = await axios.post("/api/v1/auth/login", { email, password });
    alert(result.data.msg);
    window.location = "/home";
  } catch (error) {
    console.error(error);
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
    console.error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const result = await axios.get("/api/v1/auth/showMe");
    return result.data.currentUser;
  } catch (error) {
    console.error(error);
  }
};

export const getExploreSectionPosts = async () => {
  try {
    const result = await axios.get(
      `/api/v1/post/explore?page=${state.explorePage}`
    );
    state.followingPage = 1;
    state.explorePage += 1;
    return result.data.posts;
  } catch (error) {
    console.error(error);
  }
};

export const getFollowingSectionPosts = async () => {
  try {
    const result = await axios.get(
      `/api/v1/post/following?page=${state.followingPage}`
    );
    state.explorePage = 1;
    state.followingPage += 1;

    return result.data.posts;
  } catch (error) {
    console.error(error);
  }
};

export const saveUnsavePost = async (postId) => {
  try {
    const result = await axios.get(`/api/v1/post/${postId}/save`);
    console.log(result.data.msg);
  } catch (error) {
    console.log(error);
  }
};
