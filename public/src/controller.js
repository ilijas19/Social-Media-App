import * as model from "./model.js";
import loginView from "./views/loginView.js";
import registerView from "./views/registerView.js";
import menuView from "./views/menuView.js";
import homeView from "./views/homeView.js";
import savedView from "./views/savedView.js";
import profileView from "./views/profileView.js";

const authController = () => {
  if (
    window.location.pathname === "/login" ||
    window.location.pathname === "/register"
  ) {
    loginView.addLoginFormListener(model.loginUser);
    registerView.addRegisterFormListeners(model.registerUser);
  }
};

const menuController = async () => {
  if (
    window.location.pathname === "/login" ||
    window.location.pathname === "/register"
  ) {
    return;
  }
  const currentUser = await model.getCurrentUser();
  model.state.currentUser = currentUser;

  menuView._usernameEl.textContent = model.state.currentUser.username;
  menuView.addPageMenuListeners();
  homeView.addPageBackListener();
};

const homeController = async () => {
  if (window.location.pathname === "/home") {
    //---FIRST LOAD---\\
    homeView.loadPage(model.getExploreSectionPosts);
    homeView.addPostInteractionListeners(model);

    //--- SWITCHING SECTIONS ---\\
    homeView.addSectionNavigationListeners(
      model.getExploreSectionPosts,
      model.getFollowingSectionPosts,
      model.state
    );
    //--- PUBLISHING POSTS ---\\
    homeView.addPostFormListeners(model.createPost);
    homeView._addFileInputListener();
  }
};

const savedPageController = async () => {
  if (window.location.pathname === "/saved") {
    model.state.savedPage = 1;
    savedView.loadPage(model.getSavedPosts);
    savedView.addPostInteractionListeners(model);
  }
};

const profilePageController = () => {
  if (window.location.pathname === "/profile") {
    model.state.ownPostsPage = 1;
    profileView.renderProfileInfo(model.state.currentUser);
    profileView.loadPage(model.getOwnPosts);
    profileView.addPostInteractionListeners(model);
    profileView.addProfileNavListeners(
      model.getOwnPosts,
      model.getLikedPosts,
      model.state
    );
  }
};

const init = async () => {
  authController();
  await menuController();
  homeController();
  savedPageController();
  profilePageController();
};

init();
