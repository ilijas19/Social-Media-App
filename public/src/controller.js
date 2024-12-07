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
    //---FIRST LOAD---\\
    const currentUser = await model.getCurrentUser();
    model.state.currentUser = currentUser;
    homeView.loadPage(model.getExploreSectionPosts);
    homeView.addPostInteractionListeners();
    homeView.addFileInputListener();

    //-- SWITCHING PAGES --\\

    //--- SWITCHING SECTIONS ---\\
    homeView.addSectionNavigationListeners(
      model.getExploreSectionPosts,
      model.getFollowingSectionPosts
    );
  }
};

const init = () => {
  authController();
  homeController();
};

init();
