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
  _profileActionButton = document.querySelector(".profile-action-btn");
  _followingEl = document.querySelector(".following");
  _followersEl = document.querySelector(".followers");
  _mainSection = document.querySelector(".main");
  _followSection = document.querySelector(".follow-section");
  _followingBackIcon = document.querySelector(".following-back-icon");
  _profileContainer = document.querySelector(".profile-container");
  _navItems = document.querySelectorAll(".nav-item");
  _followingNavItem = document.querySelector(".following-item");
  _followersNavItem = document.querySelector(".followers-item");
  _profileSpinner = document.querySelector(".profile-spinner");
  _editProfileSection = document.querySelector(".edit-profile-section");
  _editBackIcon = document.querySelector(".edit-back-icon");
  _editProfileForm = document.querySelector(".edit-profile-form");
  _editInputFile = document.querySelector(".input-file");
  _editInputBio = document.getElementById("bio");
  _editSpinner = document.querySelector(".edit-spinner");

  //RENDERING USER INFO
  renderProfileInfo(user) {
    this._profileImg.src = user.profilePicture;
    this._profileName.textContent = user.username;
    this._profileBio.textContent = user.bio;
    this._numFollowers.textContent = user.numFollowers;
    this._numFollowing.textContent = user.numFollowing;
  }

  showOwnProfileButtons() {
    this._likedPostsNavBtn.style.display = "flex";
    this._editProfileBtn.style.display = "block";
    this._profileActionButton.style.display = "none";
    this._addEditProfileBtnListener();
    this._addEditBackListeners();
  }

  //PROFILE NAVIGATION(OWN PROFILE ONLY)
  addProfileNavListeners(ownPostsHandler, likedPostsHandler, state) {
    this._profileNavButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const clicked = button.textContent.toLowerCase().trim();
        if (clicked === "liked") {
          this._toggleSelectedClass(button);
          state.likedPage = 1;
          this.loadPage(likedPostsHandler);
          console.log("ll");
        }
        if (clicked === "posts") {
          console.log("aa");
          this._toggleSelectedClass(button);
          state.ownPostsPage = 1;
          this.loadPage(ownPostsHandler);
        }
      });
    });
  }

  // follow from user profile & to show if request is already sent
  async showSearchedProfileButtons(getUserHandler, followUnfollowHandler) {
    const url = new URLSearchParams(window.location.search);
    const username = url.get("user");
    const user = await getUserHandler(username);
    console.log(user);
    this._likedPostsNavBtn.style.display = "none";
    this._editProfileBtn.style.display = "none";
    this._profileActionButton.style.display = "block";
    this._addFollowBtnListener(user, followUnfollowHandler, getUserHandler);
    //-SHOWING CORRECT BUTTON ON PROFILE LOAD
    if (user.posts === "Private") {
      if (user.requested) {
        this._profileActionButton.classList.add("requested-button");
        this._profileActionButton.textContent = "Requested";
        return;
      }
    }
    if (user.currentUserFollowing) {
      this._profileActionButton.classList.add("unfollow-button");
      this._profileActionButton.textContent = "Unfollow";
      return;
    } else {
      this._profileActionButton.classList.add("follow-button");
      this._profileActionButton.textContent = "Follow";
      return;
    }
  }

  //FOLLOW USER FUNCTIONALITY
  _addFollowBtnListener(user, followUnfollowHandler, getUserHandler) {
    this._profileActionButton.addEventListener("click", async (e) => {
      //if user is private and not following switch between follow and requested
      this._profileSpinner.style.opacity = 1;
      e.target.disabled = true;
      if (user.posts === "Private") {
        this._switchReqButtons(e.target);
        await followUnfollowHandler(user.username);
        this._profileSpinner.style.opacity = 0;
        return;
      }
      //if user is public switch between follow and unfollow btn
      if (user.privacy === "public") {
        this._switchFollButtons(e.target);
        await followUnfollowHandler(user.username);
        this._profileSpinner.style.opacity = 0;
        this._updateFollCount(getUserHandler);
        return;
      }
    });
  }
  //--------EDIT PROFILE FUNCTIONALITY-------
  _addEditProfileBtnListener(handler) {
    this._editProfileBtn.addEventListener("click", () => {
      this._togleEditSection();
    });
  }

  _addEditBackListeners() {
    this._editBackIcon.addEventListener("click", () => {
      this._togleEditSection();
    });
  }

  addEditFormListeners(pictureHandler, bioHandler) {
    this._editProfileForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const file = this._editInputFile.files[0];
      const bio = this._editInputBio.value;
      if (!file && !bio) return;

      this._editSpinner.style.opacity = 1;

      const submitButton = this._editProfileForm.querySelector(
        "button[type='submit']"
      );
      submitButton.disabled = true;
      submitButton.textContent = "Saving...";
      this._editProfileForm.style.pointerEvents = "none";

      if (file) await pictureHandler(file);
      if (bio) await bioHandler(bio);

      if (bio || file) {
        window.location.reload();
      }
    });
  }

  //---------SEE FOLLOWERS FOLLOWING FUNCTIONALITY-------
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

  addProfileContainerListeners(follHandler) {
    this._profileContainer.addEventListener("click", async (e) => {
      if (
        e.target.classList.contains("follow-button") ||
        e.target.classList.contains("unfollow-button") ||
        e.target.classList.contains("requested-button")
      ) {
        // Disable  button  find  spinner
        e.target.disabled = true;
        const spinner = e.target
          .closest(".profile")
          .querySelector(".mini-spinner");
        spinner.style.opacity = "1";
        spinner.style.animation = "spin 1s linear infinite";

        //  follow/unfollow
        const result = await follHandler(e.target.dataset.id);
        console.log(result);
        if (result === "Request Sent" || result === "Request Removed") {
          // Hide spinner  switch the button
          spinner.style.opacity = "0";
          spinner.style.animation = "none";
          this._switchReqButtons(e.target);
          return;
        }
        // Hide spinner  switch the button
        spinner.style.opacity = "0";
        spinner.style.animation = "none";
        this._switchFollButtons(e.target);
      }
    });
  }

  //-switching follow unfollow button
  _switchFollButtons(target) {
    if (target.classList.contains("unfollow-button")) {
      target.disabled = false;
      target.classList.add("follow-button");
      target.classList.remove("unfollow-button");
      target.textContent = "Follow";
      return;
    }
    if (target.classList.contains("follow-button")) {
      target.disabled = false;
      target.classList.add("unfollow-button");
      target.classList.remove("follow-button");
      target.textContent = "Unfollow";
      return;
    }
  }

  _switchReqButtons(target) {
    if (target.classList.contains("requested-button")) {
      target.disabled = false;
      target.classList.add("follow-button");
      target.classList.remove("requested-button");
      target.textContent = "Follow";
      return;
    }
    if (target.classList.contains("follow-button")) {
      target.disabled = false;
      target.classList.add("requested-button");
      target.classList.remove("follow-button");
      target.textContent = "Requested";
      return;
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

  //toggling edit profile section
  _togleEditSection() {
    this._editProfileSection.classList.toggle("hidden");
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
                : profile.requested
                ? ` <button class="requested-button" data-id=${profile.username}>Requested</button>`
                : profile.following
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
