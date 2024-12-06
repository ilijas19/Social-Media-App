class registerView {
  _usernameInputField = document.getElementById("register-username");
  _emailInputField = document.getElementById("register-email");
  _passwordInputField = document.getElementById("register-password");
  _registerForm = document.getElementById("register-form");

  addRegisterFormListeners(handler) {
    this._registerForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (
        this._usernameInputField.value === "" ||
        this._emailInputField.value === "" ||
        this._passwordInputField.value === ""
      ) {
        return;
      }
      await handler(
        this._usernameInputField.value,
        this._emailInputField.value,
        this._passwordInputField.value
      );
    });
  }
}

export default new registerView();
