import { Server } from 'socket.io';

export function connectWebSocket(server) {
    const io = new Server(server);

    io.on('connection', socket => {
        initializeSocketListeners(socket, io);
    });
}

const users = new Map();

function initializeSocketListeners(socket, io) {
    socket.on('register', (username) => {
        users.set(username, socket.id);
        socket.username = username; // store for later reference
        socket.broadcast.emit('newUser', username + ' has joined');
    });

    socket.on('privateMessage', ({ to, message }) => {
        const targetSocketId = users.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('newMessage', message);
            io.to(targetSocketId).emit('receiveMessage', message);
        }
    });

    socket.on("typing", ({ to, message }) => {
        const targetSocketId = users.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('typing', message);
        }
    });

    socket.on('disconnect', () => {
        users.delete(socket.username);
    });
}
