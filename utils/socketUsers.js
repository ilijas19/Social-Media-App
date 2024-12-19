let users = [];

const userJoin = (currentUser) => {
  const user = {
    _id: currentUser._id,
    username: currentUser.username,
    socketId: currentUser.socketId,
  };

  users.push(user);
};

const userLeave = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getOnlineUsers = () => {
  console.log(users);
  return users;
};

const joinRoom = (socket, roomId) => {
  socket.join(roomId);
  const user = users.find((user) => user.socketId === socket.id);
  user.room = roomId;
};

const leaveRoom = (socket) => {
  const user = users.find((user) => user.socketId === socket.id);
  socket.leave(user.room);
  user.room = "";
};

module.exports = { userJoin, userLeave, getOnlineUsers, joinRoom, leaveRoom };
