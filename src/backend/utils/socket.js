let io = null;

const setIO = (socketInstance) => {
  io = socketInstance;
};

const getIO = () => io;

module.exports = { setIO, getIO };
