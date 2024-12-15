import View from "./view.js";

class profileView extends View {
  _profileImg = document.querySelector(".profile-img");
  _profileName = document.querySelector(".profile-name");
  _profileBio = document.querySelector(".bio");
  _numFollowing = document.querySelector(".numFollowing");
  _numFollowers = document.querySelector(".numFollowers");
  _postsContainer = document.querySelector(".post-container");
  _profileNavButtons = document.querySelectorAll(".profile-nav-item");
  _likedPostsNavBtn = document.querySelector(".liked-nav-item");
  _editProfileBtn = document.querySelector(".edit-profile-btn");
  _followProfileBtn = document.querySelector(".follow-profile-btn");
  _followingEl = document.querySelector(".following");
  _followersEl = document.querySelector(".followers");
  _mainSection = document.querySelector(".main");
  _followSection = document.querySelector(".follow-section");
  _followingBackIcon = document.querySelector(".following-back-icon");
  _profileContainer = document.querySelector(".profile-container");
  _navItems = document.querySelectorAll(".nav-item");
  _followingNavItem = document.querySelector(".following-item");
  _followersNavItem = document.querySelector(".followers-item");

  showOwnProfileButtons() {
    this._likedPostsNavBtn.style.display = "flex";
    this._editProfileBtn.style.display = "block";
    this._followProfileBtn.style.display = "none";
    this._addEditProfileBtnListener();
  }
  showSearchedProfileButtons() {
    this._likedPostsNavBtn.style.display = "none";
    this._editProfileBtn.style.display = "none";
    this._followProfileBtn.style.display = "block";
    this._addFollowBtnListener();
  }

  //RENDERING USER INFO
  renderProfileInfo(user) {
    this._profileImg.src = user.profilePicture;
    this._profileName.textContent = user.username;
    this._profileBio.textContent = user.bio;
    this._numFollowers.textContent = user.numFollowers;
    this._numFollowing.textContent = user.numFollowing;
  }

  //SEE FOLLOWERS AND FOLLOWING LISTS
  addFollowListListeners() {}

  //PROFILE NAVIGATION(OWN PROFILE ONLY)
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

  //FOLLOW USER FUNCTIONALITY
  _addFollowBtnListener(handler) {
    this._followProfileBtn.addEventListener("click", () => {
      console.log("user followed");
    });
  }
  //EDIT PROFILE FUNCTIONALITY
  _addEditProfileBtnListener(handler) {
    this._editProfileBtn.addEventListener("click", () => {
      console.log("profile edit");
    });
  }

  //SEE FOLLOWERS FOLLOWING FUNCTIONALITY
  addFollowingFollowersListeners(
    followingHandler,
    followersHandler,
    getProfileHandler
  ) {
    //GOING PAGE BACK FROM FOLL SECTIONS
    this._followingBackIcon.addEventListener("click", async () => {
      this._toggleFollowingSection();
      await this._updateFollCount(getProfileHandler);
    });
    //followers
    this._followersEl.addEventListener("click", async () => {
      this._toggleFollowingSection();
      this._clearProfileContainer();
      this._renderSpinner();
      const profiles = await followersHandler(this._profileName.textContent);
      this._renderProfiles(profiles);
      this._setActiveNavElement(this._followersNavItem);
    });
    //following
    this._followingEl.addEventListener("click", async () => {
      this._toggleFollowingSection();
      this._clearProfileContainer();
      this._renderSpinner();
      const profiles = await followingHandler(this._profileName.textContent);
      this._renderProfiles(profiles);
      this._setActiveNavElement(this._followingNavItem);
    });

    this._addNavListeners(followingHandler, followersHandler);
  }

  addProfileContainerListeners(handler) {
    this._profileContainer.addEventListener("click", async (e) => {
      if (
        e.target.classList.contains("follow-button") ||
        e.target.classList.contains("unfollow-button")
      ) {
        // Disable  button  find  spinner
        e.target.disabled = true;
        const spinner = e.target
          .closest(".profile")
          .querySelector(".mini-spinner");
        spinner.style.opacity = "1";
        spinner.style.animation = "spin 1s linear infinite";

        //  follow/unfollow
        await handler(e.target.dataset.id);

        // Hide spinner  switch the button
        spinner.style.opacity = "0";
        spinner.style.animation = "none";
        this._switchButton(e.target);
      }
    });
  }

  //-switching follow unfollow button
  _switchButton(target) {
    if (target.classList.contains("unfollow-button")) {
      target.disabled = false;
      target.classList.add("follow-button");
      target.classList.remove("unfollow-button");
      target.textContent = "Follow";
    } else {
      target.disabled = false;
      target.classList.add("unfollow-button");
      target.classList.remove("follow-button");
      target.textContent = "Unfollow";
    }
  }

  //profile nav
  _addNavListeners(followingHandler, followersHandler) {
    this._navItems.forEach((item) => {
      item.addEventListener("click", async (e) => {
        let profiles;
        this._clearProfileContainer();
        this._renderSpinner();
        if (e.target.textContent === "Following") {
          profiles = await followingHandler(this._profileName.textContent);
          this._setActiveNavElement(e.target);
        }

        if (e.target.textContent === "Followers") {
          profiles = await followersHandler(this._profileName.textContent);
          this._setActiveNavElement(e.target);
        }

        this._renderProfiles(profiles);
      });
    });
  }

  //-updating foll counts on page back
  async _updateFollCount(handler) {
    const user = await handler(this._profileName.textContent);
    this._numFollowers.textContent = user.numFollowers;
    this._numFollowing.textContent = user.numFollowing;
  }

  //-toggling following section
  _toggleFollowingSection() {
    this._mainSection.classList.toggle("hidden");
    this._followSection.classList.toggle("hidden");
  }

  //-render profiles
  _renderProfiles(profiles) {
    this._clearProfileContainer();
    profiles.forEach((profile) => {
      const profileEl = `
      <li class="profile">
            <img src="${profile.profilePicture}" alt="" class="profile-pic" />
            <p class="profile-username">${profile.username}</p>
            <div class='mini-spinner'></div>
            ${
              profile.me
                ? ""
                : profile.following === true
                ? `<button class="unfollow-button" data-id=${profile.username}>Unfollow</button>`
                : ` <button class="follow-button" data-id=${profile.username}>Follow</button>`
            }
            
            
          </li>`;

      this._profileContainer.insertAdjacentHTML("beforeend", profileEl);
    });
  }

  //-clear profile container
  _clearProfileContainer() {
    this._profileContainer.innerHTML = "";
  }

  //Set Active Class
  _setActiveNavElement(target) {
    this._navItems.forEach((item) => {
      item.classList.remove("selected-nav-item");
    });
    target.classList.add("selected-nav-item");
  }

  //spinner
  _renderSpinner() {
    const el = `<div class="following-spinner"></div>`;
    this._profileContainer.insertAdjacentHTML("beforeend", el);
  }

  _toggleSelectedClass(el) {
    this._profileNavButtons.forEach((button) => {
      button.classList.remove("selected-nav-item");
    });
    el.classList.add("selected-nav-item");
  }
}

export default new profileView();
