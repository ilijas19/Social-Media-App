import View from "./view.js";

class profileView extends View {
  _profileImg = document.querySelector(".profile-img");
  _profileName = document.querySelector(".profile-name");
  _profileBio = document.querySelector(".bio");
  _numFollowing = document.querySelector(".numFollowing");
  _numFollowers = document.querySelector(".numFollowers");
  _postsContainer = document.querySelector(".post-container");
  _profileNavButtons = document.querySelectorAll(".profile-nav-item");

  renderProfileInfo(user) {
    this._profileImg.src = user.profilePicture;
    this._profileName.textContent = user.username;
    this._profileBio.textContent = user.bio;
    this._numFollowers.textContent = user.numFollowers;
    this._numFollowing.textContent = user.numFollowing;
  }

  addProfileNavListeners(ownPostsHandler, likedPostsHandler, state) {
    this._profileNavButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const clicked = button.textContent.toLowerCase();
        if (clicked === "liked") {
          this._toggleSelectedClass(button);
          state.likedPage = 1;
          this.loadPage(likedPostsHandler);
        }
        if (clicked === "posts") {
          this._toggleSelectedClass(button);
          state.ownPostsPage = 1;
          this.loadPage(ownPostsHandler);
        }
      });
    });
  }

  _toggleSelectedClass(el) {
    this._profileNavButtons.forEach((button) => {
      button.classList.remove("selected-nav-item");
    });
    el.classList.add("selected-nav-item");
  }
}

export default new profileView();
