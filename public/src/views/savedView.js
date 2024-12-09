class savedView {
  _postsContainer = document.querySelector(".post-container");

  //---LOADING PAGE---\\ - based of handler that is being passed
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
    this._postsContainer?.addEventListener("click", async (e) => {
      const target = e.target;

      if (target.classList.contains("like-icon")) {
        this._handleLike(target.dataset.id, model.likeUnlikePost, target);
      }

      if (target.classList.contains("comment-icon")) {
        this._handleComment(target.dataset.id);
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
  _handleComment(postId) {
    console.log(`Handle comment postId:${postId}`);
  }
  async _handleSave(postId, saveHandler, target) {
    this._toggleSaveBookmark(target);
    await saveHandler(postId);
  }
  //---------------------------------------------\\

  // HELPERS
  _clearContainer() {
    this._postsContainer.innerHTML = "";
  }
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
}

export default new savedView();
