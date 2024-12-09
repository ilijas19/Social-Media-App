import * as model from "./model.js";
import loginView from "./views/loginView.js";
import registerView from "./views/registerView.js";
import menuView from "./views/menuView.js";
import homeView from "./views/homeView.js";
import savedView from "./views/savedView.js";

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
  console.log("called");
  const currentUser = await model.getCurrentUser();
  model.state.currentUser = currentUser;
  menuView._usernameEl.textContent = model.state.currentUser.username;
  menuView.addPageMenuListeners();
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
  }
};

const savedPageController = async () => {
  if (window.location.pathname === "/saved") {
    savedView.loadPage(model.getSavedPosts);
    homeView.addPostInteractionListeners(model);
  }
};

const init = async () => {
  authController();
  await menuController();
  homeController();
  savedPageController();
};

init();
