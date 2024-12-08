class homeView {
  _fileInput = document.getElementById("file-input");
  _fileNameEl = document.getElementById("file-name");
  _postsContainer = document.querySelector(".post-container");
  _exploreBtn = document.getElementById("explore-btn");
  _followingBtn = document.getElementById("following-btn");

  constructor() {}

  //---SWITCHING SECTIONS---\\
  addSectionNavigationListeners(explorePostHandler, followingPostHandler) {
    this._exploreBtn.addEventListener("click", () => {
      this._toggleSelectedNavClass(this._exploreBtn);
      this.loadPage(explorePostHandler);
    });
    this._followingBtn.addEventListener("click", () => {
      this._toggleSelectedNavClass(this._followingBtn);
      this.loadPage(followingPostHandler);
    });
  }

  //---LOADING PAGE---\\
  async loadPage(handler) {
    try {
      const posts = await handler();
      this._renderPosts(posts);
    } catch (error) {
      console.log(error);
    }
  }

  //--ADDING POST INTERACTION LISTENERS--\\
  addPostInteractionListeners(currentUser) {
    this._postsContainer?.addEventListener("click", (e) => {
      const target = e.target;

      if (target.classList.contains("like-icon")) {
        this._handleLike(target.dataset.id);
      }

      if (target.classList.contains("comment-icon")) {
        this._handleComment(target.dataset.id);
      }

      if (target.classList.contains("save-icon")) {
        this._handleComment(target.dataset.id);
      }
    });
  }

  //-File input listener-\\
  addFileInputListener() {
    this._fileInput.addEventListener("change", (e) => {
      // console.log(e.target);
      // console.log(e.target.files);
      const fileName = e.target.files[0]
        ? e.target.files[0].name
        : "No File Selected";
      this._fileNameEl.textContent = fileName;
    });
  }

  //PRIVATE FUNCTIONS

  //--rendering posts
  _renderPosts(posts) {
    this._postsContainer.innerHTML = "";
    posts.forEach((post) => {
      const postEl = `
      <li class="post" value=${post._id}>
            <img 
              src=${post.publisherId.profilePicture}
              class="publisher-profile-photo"
              alt=''
            />
            <p class="publisher-name">
              ${post.publisherUsername} &middot; <span>${this._formatDate(
        post.createdAt
      )}</span><i class="fa-solid fa-ellipsis"></i>
            </p>
               <p class="post-text">
             ${post.text}
            </p>
            <div class="img-div">
              <img src=${post.imgUrl} alt="" class="post-img" />
            </div>
            <div class="post-interaction">
              <div class="interaction-div like-div" >
                <i class="fa-regular fa-heart icon like-icon" data-id=${
                  post._id
                }></i>
                <p class="like-number number">${post.numberOfLikes}</p>
              </div>
              <div class="interaction-div comment-div" >
                <i class="fa-regular fa-comment icon comment-icon" data-id=${
                  post._id
                }></i>
                <p class="comment-number number">${post.comments.length}</p>
              </div>
              <i class="fa-regular fa-bookmark icon save-icon" data-id=${
                post._id
              }></i>
            </div>
          </li>
      `;
      this._postsContainer.insertAdjacentHTML("beforeend", postEl);
    });
  }

  _handleLike(postId) {
    console.log(`Handle like postId:${postId}`);
  }
  _handleComment(postId) {
    console.log(`Handle comment postId:${postId}`);
  }
  _handleSave(postId) {
    console.log(`Handle save postId:${postId}`);
  }

  //---HELPRERS--\\
  _formatDate(date) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    };

    return new Date(date).toLocaleString("en-US", options);
  }

  _toggleSelectedNavClass(el) {
    document
      .querySelectorAll(".navigation li")
      .forEach((el) => el.classList.remove("selected-nav"));
    el.classList.add("selected-nav");
  }
}

export default new homeView();
