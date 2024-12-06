class loginView {
  _emailInputField = document.getElementById("login-email");
  _passwordInputField = document.getElementById("login-password");
  _loginForm = document.getElementById("login-form");

  addLoginFormListener(handler) {
    this._loginForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (
        this._emailInputField.value === "" ||
        this._passwordInputField.value === ""
      )
        return;

      await handler(
        this._emailInputField.value,
        this._passwordInputField.value
      );
    });
  }
}

export default new loginView();
