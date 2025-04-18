import { Server } from 'socket.io';

export function connectWebSocket(server) {
    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log('New user connected', socket.id);

        socket.emit('newMessage', {
            from: 'Server',
            text: 'Welcome!',
            createdAt: Date.now(),
        });

        initializeSocketListeners(socket, io)
    });
}


function initializeSocketListeners(socket, io) {
    socket.on('newMessage', (message) => {
        console.log('New message:', message);
        socket.broadcast.emit('newMessage', message); // Send to everyone except the sender
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('locationMessage', (coords) => {
        console.log('Location:', coords);
        io.emit("locationMessage", {
            ...coords,
            url: `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
            time: Date.now(),
        }); // Send to everyone
    });
}

// socket.emit -> socket.on
// socket.broadcast.emit -> socket.on