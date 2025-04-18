import { Server } from 'socket.io';

export function connectWebSocket(server) {
    const io = new Server(server);

    io.on('connection', socket => {
        initializeSocketListeners(socket, io);
    });
}


function initializeSocketListeners(socket, io) {
    socket.on('newMessage', (message) => {
        // socket.broadcast.emit('newMessage', message);
        io.emit("newMessage", message);
    });

    socket.on("typing", (message) => {
        socket.broadcast.emit('typing', message);
    })
}