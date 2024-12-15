class searchView {
  _searchForm = document.querySelector(".search-form");
  _searchInput = document.querySelector(".search-input");
  _searchUsersFunction = null;
  _resultContainer = document.querySelector(".results-container");

  addSearchFormListeners(handler) {
    this._searchForm.removeEventListener("submit", this._searchUsersFunction);

    this._searchUsersFunction = async (e) => {
      e.preventDefault();
      if (this._searchInput.value === "") return;
      const users = await handler(this._searchInput.value);
      this._renderUsers(users);
      this._searchInput.value = "";
    };

    this._searchForm.addEventListener("submit", this._searchUsersFunction);
  }

  _renderUsers(users) {
    this._resultContainer.innerHTML = "";
    users.forEach((user) => {
      const html = `
       <li class="result" data-id=${user._id}>
            <img
              src=${user.profilePicture}
              alt=""
              class="menu-profile-img"
            />
            <p class="result-info">${user.username}</p>
          </li>
      `;
      this._resultContainer.insertAdjacentHTML("beforeend", html);
    });
  }

  addUserProfileListeners() {
    this._resultContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("result")) {
        window.location = `/profile?user=${
          e.target.querySelector(".result-info").textContent
        }`;
      }
    });
  }
}
export default new searchView();
