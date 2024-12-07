export const state = {
  currentUser: {},
  page: "",
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

export const getExploreSectionPosts = async (page = 1) => {
  try {
    const result = await axios.get(`/api/v1/post/explore?page=${page}`);

    return result.data.posts;
  } catch (error) {
    console.error(error);
  }
};

export const getFollowingSectionPosts = async (page = 1) => {
  try {
    const result = await axios.get(`/api/v1/post/following?page=${page}`);

    return result.data.posts;
  } catch (error) {
    console.error(error);
  }
};
