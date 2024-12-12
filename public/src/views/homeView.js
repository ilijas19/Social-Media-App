import View from "./view.js";

class homeView extends View {
  _fileInput = document.getElementById("file-input");
  _fileNameEl = document.getElementById("file-name");
  _postsContainer = document.querySelector(".post-container");
  _exploreBtn = document.getElementById("explore-btn");
  _followingBtn = document.getElementById("following-btn");
  _postForm = document.querySelector(".post-form");
  _postInput = document.querySelector(".post-input");
  _createPostFunction = null;

  //---SWITCHING SECTIONS---\\
  addSectionNavigationListeners(
    explorePostHandler,
    followingPostHandler,
    state
  ) {
    //loading different sections based on button that is clicked
    this._exploreBtn.addEventListener("click", () => {
      //setting page to 1 on each section button click
      state.explorePage = 1;
      this._toggleSelectedNavClass(this._exploreBtn);
      this.loadPage(explorePostHandler);
    });
    this._followingBtn.addEventListener("click", () => {
      //setting page to 1 on each section button click
      state.followingPage = 1;
      this._toggleSelectedNavClass(this._followingBtn);
      this.loadPage(followingPostHandler);
    });
  }

  //---PUBLISHING POSTS---\\
  addPostFormListeners(handler) {
    this._postForm.removeEventListener("submit", this._createPostFunction);

    this._createPostFunction = async (e) => {
      e.preventDefault();

      const text = this._postInput.value.trim(); //  text
      const imageFile = this._fileInput.files[0]; //  selected file

      this._postInput.value = "";
      this._fileInput.value = "";

      if (!text || !imageFile) {
        alert("Please provide both text and an image.");
        return;
      }

      const post = await handler(text, imageFile);
      window.location.reload();
    };

    this._postForm.addEventListener("submit", this._createPostFunction);
  }

  //--HELPERS--\\
  _toggleSelectedNavClass(el) {
    document
      .querySelectorAll(".navigation li")
      .forEach((el) => el.classList.remove("selected-nav"));
    el.classList.add("selected-nav");
  }

  _addFileInputListener() {
    this._fileInput.addEventListener("change", (e) => {
      // console.log(e.target);
      // console.log(e.target.files);
      const fileName = e.target.files[0]
        ? e.target.files[0].name
        : "No File Selected";
      this._fileNameEl.textContent = fileName;
    });
  }
}

export default new homeView();
