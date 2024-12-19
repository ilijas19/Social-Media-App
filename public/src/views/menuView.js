class MenuView {
  _menuItems = document.querySelectorAll(".menu-item");
  _usernameEl = document.querySelector(".menu-profile-username");
  _hamburgerIcon = document.querySelector(".hamburger-icon");
  _closeMenuIcon = document.querySelector(".close-menu-icon");
  _menuSection = document.querySelector(".menu-section");

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
    this._addToggleMenuFunctionality();
  }

  _addToggleMenuFunctionality() {
    this._hamburgerIcon.addEventListener("click", () => {
      this._openMenu();
    });
    this._closeMenuIcon.addEventListener("click", () => {
      this._closeMenu();
    });
  }

  _openMenu() {
    this._menuSection.style.left = 0;
  }

  _closeMenu() {
    this._menuSection.style.left = "-40rem";
  }
}

export default new MenuView();
