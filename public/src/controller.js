import * as model from "./model.js";
import loginView from "./views/loginView.js";
import registerView from "./views/registerView.js";
import homeView from "./views/homeView.js";

const authController = () => {
  if (
    window.location.pathname === "/login" ||
    window.location.pathname === "/register"
  ) {
    loginView.addLoginFormListener(model.loginUser);
    registerView.addRegisterFormListeners(model.registerUser);
  }
};
const homeController = async () => {
  if (window.location.pathname === "/home") {
    //SETTING CURRENT USER
    const currentUser = await model.getCurrentUser();
    model.state.currentUser = currentUser;

    //SHOWING EXPLORE SECTION POSTS ON OPENING PAGE
    const explorePosts = await model.getExploreSectionPosts();
    console.log(explorePosts);
    homeView.renderPosts(explorePosts);
    homeView.addPostInteractionListeners();
    homeView.addFileInputListener();
  }
};

const init = () => {
  authController();
  homeController();
};

init();
