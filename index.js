const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.static('public'));
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.send('Socket is running');
});

// io = require('socket.io')(PORT, {
//   cors: {
//     origin: 'https://codecial.netlify.app/',
//   },
// });

http.listen(PORT, (req, res) => {
  console.log(`listening on ${PORT}`);
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
  console.log('User Connected');
  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit('getUsers', users);
  });

  //Send Message
  socket.on('sendMessage', ({ senderId, receiverId, text }) => {
    // console.log(senderId, receiverId, text);
    const user = getUser(receiverId);
    io.to(user?.socketId).emit('getMessage', {
      senderId,
      text,
    });
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected');
    removeUser(socket.id);
    io.emit('getUsers', users);
  });
});
