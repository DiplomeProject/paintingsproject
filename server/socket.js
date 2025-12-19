const { Server } = require('socket.io');
let io = null;

function init(server, options = {}) {
  if (io) return io;
  io = new Server(server, {
    cors: {
      origin: 'https://bestartgallery.pp.ua',
      credentials: true
    },
    ...options
  });

  io.on('connection', (socket) => {
    // join room
    socket.on('join', (room) => {
      socket.join(room);
    });
    socket.on('leave', (room) => {
      socket.leave(room);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { init, getIO };