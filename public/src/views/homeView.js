import View from "./view.js";

class homeView extends View {
  _fileInput = document.getElementById("file-input");
  _fileNameEl = document.getElementById("file-name");
  _postsContainer = document.querySelector(".post-container");
  _exploreBtn = document.getElementById("explore-btn");
  _followingBtn = document.getElementById("following-btn");

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
