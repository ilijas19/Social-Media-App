class messageView {
  _startChatPopupEl = document.querySelector(".start-chat-popup");
  _startChatIcon = document.querySelector(".start-chat-icon");
  _closePopupIcon = document.querySelector(".close-popup-icon");
  _searchForm = document.querySelector(".search-form");
  _searchInput = document.querySelector(".search-input");
  _usersContainer = document.querySelector(".users-container");
  _chatsContainer = document.querySelector(".chats-continer");
  _privateChatWindow = document.querySelector(".private-chat");
  _msgForm = document.querySelector(".msg-form");
  _msgInput = document.querySelector(".msg-input");
  _pageBackIcon = document.querySelector(".page-back-icon");
  _msgBackIcon = document.querySelector(".msg-back-icon");
  _chatTitle = document.querySelector(".chat-title");

  _currentUser = null;
  _currentChatId = null;
  _currentChatParticipant = null;
  _currentRoom = null;

  //loading existing chats on opening messages window
  async renderChats(getChatsHandler) {
    const { chatsWithData } = await getChatsHandler();
    chatsWithData.forEach((chat) => {
      const el = `
          <li class="chat" data-id='${chat._id}'>
            <img
              src="${chat.otherUser[0].profilePicture}"
              alt=""
              class="chat-img"
            />
            <div class="chat-info">
              <p class="chat-name">${chat.otherUser[0].username}</p>
              <p class="new-msg hidden">NEW MESSAGE</p>
            </div>
            <i class="fa-solid fa-ellipsis chat-icon"></i>
          </li>
      `;
      this._chatsContainer.insertAdjacentHTML("beforeend", el);
    });
  }

  //adding listeners to listed current chats
  addChatListeners(getChatMessagesHandler, socket) {
    this._chatsContainer.addEventListener("click", async (e) => {
      if (e.target.classList.contains("chat")) {
        const participantUsername = e.target
          .querySelector(".chat-info")
          .querySelector(".chat-name").textContent;

        //here
        await this._openPrivateChat(
          e.target.dataset.id,
          getChatMessagesHandler,
          participantUsername,
          socket
        );
      }
    });
    //CLOSING CHAT ICON
    this._addClosingPrivateChatListeners(socket);
  }

  _addClosingPrivateChatListeners(socket) {
    this._msgBackIcon.addEventListener("click", () => {
      this._togglePrivateChatWindow();
      this._chatTitle.textContent = "Messages";
      socket.emit("leaveRoom");
    });
  }

  //adding listeners for new chat btn
  addNewChatBtnListeners(handler) {
    this._startChatIcon.addEventListener("click", () => {
      this._toggleChatPopup();
    });
    this._closePopupIcon.addEventListener("click", () => {
      this._toggleChatPopup();
    });

    this._searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (this._searchInput.value === "") return;
      this._clearUsersContainer();
      const users = await handler(this._searchInput.value);
      users.forEach((user) => {
        const el = `
        <li class="user-item" data-id="${user._id}">
          <img class="user-picture" src="${user.profilePicture}" alt="" />
          <p class="user-username">${user.username}</p>
        </li>
        `;
        this._usersContainer.insertAdjacentHTML("beforeend", el);
      });
    });
  }

  //adding listeners for listed users in new chat popup
  addStartChatListeners(createChatHandler, getChatMessagesHandler, socket) {
    this._usersContainer.addEventListener("click", async (e) => {
      if (e.target.classList.contains("user-item")) {
        const participantUsername =
          e.target.querySelector(".user-username").textContent;

        const { chat = null, existingChat = null } = await createChatHandler(
          e.target.dataset.id
        );
        //IF CHAT ALREADY EXISTS
        //here
        if (existingChat) {
          await this._openPrivateChat(
            existingChat._id,
            getChatMessagesHandler,
            participantUsername,
            socket
          );
        }
        //IF NEW CHAT IS CREATED
        //here
        if (chat) {
          await this._openPrivateChat(
            chat._id,
            getChatMessagesHandler,
            participantUsername,
            socket
          );
        }
      }
    });
  }

  addMessageFormListeners(socket, createMessageHandler, username) {
    this._msgForm.addEventListener("submit", async (e) => {
      e.preventDefault("");
      if (this._msgInput.value === "") return;
      const message = this._formatMessage(this._msgInput.value, username);

      socket.emit("messageFromClient", { message, room: this._currentRoom });
      await createMessageHandler(this._currentRoom, message.text);
    });
  }

  _formatMessage(text, username) {
    return {
      from: username,
      text,
      createdAt: this._formatTimestamp(new Date()),
    };
  }

  //--OPENING PRIVATE CHAT
  async _openPrivateChat(chatId, getChatMessagesHandler, participant, socket) {
    this._currentChatId = chatId;
    this._currentChatParticipant = participant;
    this._chatTitle.textContent = participant;
    this._togglePrivateChatWindow();
    this._clearPrivateChat();
    this._renderSpinner();
    const { messages } = await getChatMessagesHandler(chatId);
    this._renderMessages(messages);
    this._currentRoom = chatId;

    socket.emit("joinRoom", { chatId });
  }

  _renderMessages(messages) {
    this._clearPrivateChat();
    messages.forEach((message) => {
      const el = `
      <li class="message ${
        message.senderId.username !== this._currentChatParticipant
          ? "message-right"
          : "message-left"
      }">
            <p class="message-from">${
              message.senderId.username
            }<span>${this._formatTimestamp(message.createdAt)}</span></p>
            <p class="message-text">${message.text}</p>
          </li>
      `;
      this._privateChatWindow.insertAdjacentHTML("beforeend", el);
    });
  }

  _renderMessage(message) {
    const el = `
    <li class="message ${
      message.from !== this._currentChatParticipant
        ? "message-right"
        : "message-left"
    }">
          <p class="message-from">${message.from}<span>${
      message.createdAt
    }</span></p>
          <p class="message-text">${message.text}</p>
        </li>
    `;
    this._privateChatWindow.insertAdjacentHTML("beforeend", el);
  }

  _clearPrivateChat() {
    this._privateChatWindow.innerHTML = "";
  }

  _renderSpinner() {
    this._privateChatWindow.insertAdjacentHTML(
      "beforeend",
      '<div class="private-chat-spinner"></div>'
    );
  }

  _formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    return date.toLocaleString("en-US", options);
  }

  _togglePrivateChatWindow() {
    //closing popup if its open
    this._closeChatPopup();
    this._chatsContainer.classList.toggle("hidden");
    this._privateChatWindow.classList.toggle("hidden");
    this._msgForm.classList.toggle("hidden");
    this._msgBackIcon.classList.toggle("hidden");
    this._pageBackIcon.classList.toggle("hidden");
    this._startChatIcon.classList.toggle("hidden");
  }

  _toggleChatPopup() {
    this._startChatPopupEl.classList.toggle("hidden");
  }
  _closeChatPopup() {
    this._startChatPopupEl.classList.add("hidden");
  }

  _clearUsersContainer() {
    this._usersContainer.innerHTML = "";
  }
}

export default new messageView();
