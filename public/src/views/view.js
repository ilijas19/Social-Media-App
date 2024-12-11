export default class View {
  _pageBackIcon = document.querySelector(".page-back-icon");
  _selectedBackIcon = document.querySelector(".selected-back-icon");
  _selectedPostSection = document.querySelector(".selected-post-section");
  _mainSection = document.querySelector(".main");
  _selectedPagePostDiv = document.querySelector(".selected-page-post");
  _commentContainer = document.querySelector(".comment-container");
  _commentForm = document.querySelector(".selected-post-form");
  _commentInput = document.querySelector(".comment-input");
  _commentSubmitFunction = null;
  _commentDeleteFunction = null;
  _currentUser = null;
  _selectedPost = null;

  //---LOADING PAGE---\\ - based of handler that is being passed
  setViewCurrentUser(currentUser) {
    this._currentUser = currentUser;
  }

  async loadPage(handler) {
    try {
      this._clearContainer();
      window.scrollTo({ top: 0, behavior: "smooth" });
      const posts = await handler();
      //passing handler to render posts
      this._renderPosts(posts, handler);
    } catch (error) {
      console.error(error);
    }
  }

  //--RENDERING POSTS--\\
  _renderPosts(posts, handler) {
    //handler passed from load page()
    //rendering fetched posts
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
                <i class="${
                  post.isLiked ? "fa-solid cRed" : "fa-regular cDdd"
                } fa-heart icon like-icon" data-id=${post._id}></i>
                <p class="like-number number">${post.numberOfLikes}</p>
              </div>
              <div class="interaction-div comment-div" >
                <i class="fa-regular fa-comment icon comment-icon" data-id=${
                  post._id
                }></i>
                <p class="comment-number number">${post.comments.length}</p>
              </div>
              <i class="${
                post.isSaved ? "fa-solid" : "fa-regular"
              } fa-bookmark icon save-icon" data-id=${post._id}></i>
            </div>
          </li>
      `;
      this._postsContainer.insertAdjacentHTML("beforeend", postEl);
    });
    //if less then 10 post then there is no new page so no need for show more button
    if (posts.length < 10) return;
    this._postsContainer.insertAdjacentHTML(
      "beforeend",
      "<button class='show-more-btn'>Show More</button>"
    );

    this._addShowMoreButtonListeners(handler);
  }

  //--SHOW MORE BUTTON--\\
  _addShowMoreButtonListeners(handler) {
    const showMoreBtn = this._postsContainer.querySelector(".show-more-btn");
    //--on clicking show more button
    showMoreBtn?.addEventListener("click", async () => {
      try {
        //getting new page posts
        const posts = await handler();
        //removing old show more btn
        showMoreBtn.remove();
        //appending new posts and button
        this._renderPosts(posts, handler);
      } catch (error) {
        console.error(error);
      }
    });
  }

  //--ADDING POST INTERACTION LISTENERS--\\

  addPostInteractionListeners(model) {
    //setting current user
    this.setViewCurrentUser(model.state.currentUser);

    this._postsContainer?.addEventListener("click", async (e) => {
      const target = e.target;

      if (target.classList.contains("like-icon")) {
        this._handleLike(target.dataset.id, model.likeUnlikePost, target);
      }

      if (target.classList.contains("comment-icon")) {
        this._handleComment(
          target.dataset.id,
          model.getSinglePost,
          model.createComment,
          target,
          model.deleteComment
        );
      }

      if (target.classList.contains("save-icon")) {
        await this._handleSave(target.dataset.id, model.saveUnsavePost, target);
      }
    });
  }

  //--POST INTERACTIONS--\\
  async _handleLike(postId, likeHandler, target) {
    this._toggleLike(target);
    await likeHandler(postId);
  }

  async _handleComment(
    postId,
    getPostHandler,
    commentHandler,
    target,
    delCommentHandler
  ) {
    const post = await getPostHandler(postId);
    this._toggleSelectedPostPage();
    this._renderSelectedPost(post);
    this._renderComments(post.comments, post);
    this._addCommentListeners(commentHandler, postId, getPostHandler, target);
    this._addDeleteListeners(delCommentHandler, getPostHandler, postId, target);
  }

  async _handleSave(postId, saveHandler, target) {
    this._toggleSaveBookmark(target);
    await saveHandler(postId);
  }
  //---------SELECTED POST PAGE---------\\
  _addDeleteListeners(delCommentHandler, getPostHandler, postId, target) {
    this._commentContainer.removeEventListener(
      "click",
      this._commentDeleteFunction
    );

    this._commentDeleteFunction = async (e) => {
      if (e.target.classList.contains("del-comment-div")) {
        await delCommentHandler(e.target.dataset.id);
        const post = await getPostHandler(postId);
        this._renderComments(post.comments, post);
        const commentCountEl = target.nextElementSibling;
        commentCountEl.textContent = Number(commentCountEl.textContent) - 1;
      }
    };

    this._commentContainer.addEventListener(
      "click",
      this._commentDeleteFunction
    );
  }

  _toggleSelectedPostPage() {
    // Check if _mainSection is hidden
    const isMainSectionHidden = this._mainSection.classList.contains("hidden");

    // Toggle classes based on the current state
    if (isMainSectionHidden) {
      this._mainSection.classList.remove("hidden");
      this._selectedPostSection.classList.add("hidden");
    } else {
      this._mainSection.classList.add("hidden");
      this._selectedPostSection.classList.remove("hidden");
    }
  }

  _renderSelectedPost(post) {
    this._selectedPost = post;
    this._selectedPagePostDiv.innerHTML = "";
    const html = `
     <img src="${
       post.publisherId.profilePicture
     }" class="publisher-profile-photo" alt="" />
          <p class="publisher-name">
            ${post.publisherUsername} &middot;
            <span>${this._formatDate(
              post.createdAt
            )}</span><i class="fa-solid fa-ellipsis"></i>
          </p>
          <p class="post-text">
            ${post.text}
          </p>
          <div class="img-div">
            <img src="${post.imgUrl}" alt="" class="post-img" />
          </div>
    `;
    this._selectedPagePostDiv.insertAdjacentHTML("beforeend", html);
  }

  _renderComments(comments, post) {
    console.log(post);
    this._clearCommentContainer();
    comments.forEach((comment) => {
      const html = `
      <li class="comment">
            <img
              src="${comment.userId.profilePicture}"
              alt=""
              class="menu-profile-img"
            />
            <div class="comment-info-div">
              <p class="comment-info">
                ${comment.userId.username} <span>${this._formatDate(
        comment.createdAt
      )}</span>
              </p>
             
              ${
                comment.userId.username === this._currentUser.username
                  ? `<div class="del-comment-div" data-id=${comment._id}>Delete</div>`
                  : " "
              }
              
            </div>
            <p class="comment-text">
              ${comment.text}
            </p>
          </li>
      `;
      this._commentContainer.insertAdjacentHTML("afterbegin", html);
    });
  }

  _addCommentListeners(commentHandler, postId, getPostHandler, target) {
    //submiting form listeners
    this._commentForm.removeEventListener(
      "submit",
      this._commentSubmitFunction
    );

    this._commentSubmitFunction = async (e) => {
      e.preventDefault();
      if (this._commentInput.value === "") return;
      const text = this._commentInput.value;
      await commentHandler(postId, text);
      const post = await getPostHandler(postId);
      this._renderComments(post.comments);
      this._commentInput.value = "";
      const commentCountEl = target.nextElementSibling;
      commentCountEl.textContent = Number(commentCountEl.textContent) + 1;
    };

    this._commentForm.addEventListener("submit", this._commentSubmitFunction);
  }

  //---HELPRERS---\\

  _clearContainer() {
    this._postsContainer.innerHTML = "";
  }

  _clearCommentContainer() {
    this._commentContainer.innerHTML = "";
  }

  _formatDate(date) {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    };

    return new Date(date).toLocaleString("en-US", options);
  }

  _toggleSaveBookmark(target) {
    if (target.classList.contains("fa-regular")) {
      target.classList.remove("fa-regular");
      target.classList.add("fa-solid");
      return;
    }
    if (target.classList.contains("fa-solid")) {
      target.classList.remove("fa-solid");
      target.classList.add("fa-regular");
      return;
    }
  }
  _toggleLike(target) {
    const likeCountEl = target.nextElementSibling; // Select the like number element

    if (target.classList.contains("fa-regular")) {
      target.classList.remove("fa-regular");
      target.classList.add("fa-solid");
      target.style.color = "#780606";
      likeCountEl.textContent = Number(likeCountEl.textContent) + 1;
      return;
    }

    if (target.classList.contains("fa-solid")) {
      target.classList.remove("fa-solid");
      target.classList.add("fa-regular");
      target.style.color = "#ddd";
      likeCountEl.textContent = Number(likeCountEl.textContent) - 1;
      return;
    }
  }

  addPageBackListener() {
    this._pageBackIcon?.addEventListener("click", () => {
      window.location = "/home";
    });
    this._selectedBackIcon?.addEventListener("click", () => {
      this._toggleSelectedPostPage();
    });
  }
}
