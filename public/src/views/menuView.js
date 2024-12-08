class MenuView {
  _menuItems = document.querySelectorAll(".menu-item");
  _usernameEl = document.querySelector(".menu-profile-username");

  //-- SWITCHING PAGES --\\
  addPageMenuListeners() {
    this._menuItems?.forEach((el) => {
      el.addEventListener("click", (e) => {
        const menuItem = e.target
          .closest(".menu-item")
          .querySelector(".menu-item-text").textContent;
        window.location = `/${menuItem.toLowerCase()}`;
      });
    });
  }
}

export default new MenuView();
