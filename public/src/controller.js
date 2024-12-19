import * as model from "./model.js";
import loginView from "./views/loginView.js";
import registerView from "./views/registerView.js";
import menuView from "./views/menuView.js";
import homeView from "./views/homeView.js";
import savedView from "./views/savedView.js";
import profileView from "./views/profileView.js";
import searchView from "./views/searchView.js";
import messageView from "./views/messagesView.js";

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

const profilePageController = async () => {
  if (window.location.pathname === "/profile") {
    const urlParams = new URLSearchParams(window.location.search);
    const paramUsername = urlParams.get("user");
    //LOADING SEARCHED USER PROFILE
    if (paramUsername) {
      const user = await model.getUserProfile(paramUsername);
      if (user) {
        //IF USER FROM URL IS CURRENT USER
        if (user.username === model.state.currentUser.username) {
          window.location = "/profile";
          return;
        }
        //IF USER FROM URL IS FOUND
        model.state.ownPostsPage = 1;
        profileView.renderProfileInfo(user);
        profileView.loadPage(async () => {
          return await model.getUserProfilePosts(user.username);
        });
        //here
        profileView.showSearchedProfileButtons(
          model.getUserProfile,
          model.followUnfollowUser
        );
        //
        profileView.addPostInteractionListeners(model);
        profileView.addFollowingFollowersListeners(
          model.getUserFollowing,
          model.getUserFollowers,
          model.getUserProfile
        );
        profileView.addProfileContainerListeners(
          model.followUnfollowUser,
          //
          model.getUserProfile
        );
        return;
      } else {
        //if user from url doesent exists
        window.location = "/profile";
      }
    }
    //LOADING OWN PROFILE
    model.state.ownPostsPage = 1;
    profileView.renderProfileInfo(model.state.currentUser);
    profileView.showOwnProfileButtons();
    profileView.loadPage(model.getOwnPosts);
    profileView.addPostInteractionListeners(model);
    profileView.addProfileNavListeners(
      model.getOwnPosts,
      model.getLikedPosts,
      model.state
    );
    profileView.addFollowingFollowersListeners(
      model.getUserFollowing,
      model.getUserFollowers,
      model.getUserProfile
    );
    profileView.addProfileContainerListeners(
      model.followUnfollowUser,
      //
      model.getUserProfile
    );
    profileView.addEditFormListeners(
      model.updateProfilePicture,
      model.updateBio
    );
  }
};

const searchPageController = () => {
  if (window.location.pathname === "/search") {
    searchView.addSearchFormListeners(model.searchForUser);
    searchView.addUserProfileListeners();
  }
};

const messagesPageController = async () => {
  if (window.location.pathname === "/messages") {
    //SOCKET IO
    const socket = io();
    socket.on("join", (data) => {
      model.state.currentUser.socketId = data.id;

      socket.emit("joinFromClient", {
        currentUser: model.state.currentUser,
      });
    });

    socket.on("messageFromServer", (message) => {
      messageView._renderMessage(message);
    });
    //page
    await messageView.renderChats(model.getAllChats);
    messageView.addNewChatBtnListeners(model.searchForUser);
    messageView.addStartChatListeners(
      model.createChat,
      model.getChatMessages,
      socket
    );
    messageView.addChatListeners(model.getChatMessages, socket);
    messageView.addMessageFormListeners(
      socket,
      model.createMessage,
      model.state.currentUser.username
    );
  }
};

const init = async () => {
  authController();
  await menuController();
  homeController();
  savedPageController();
  profilePageController();
  searchPageController();
  messagesPageController();
};

init();
