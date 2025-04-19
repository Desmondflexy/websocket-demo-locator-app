import { Server } from 'socket.io';

export function connectWebSocket(server) {
    const io = new Server(server);

    io.on('connection', socket => {
        initializeSocketListeners(socket, io);
    });
}


function initializeSocketListeners(socket, io) {
    socket.on('newMessage', (data) => {
        io.emit("newMessage", data);
        socket.broadcast.emit('receiveMessage');
    });

    socket.on("typing", (message) => {
        socket.broadcast.emit('typing', message);
    });
}
