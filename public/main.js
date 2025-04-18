document.addEventListener('DOMContentLoaded', main);
let typingTimeout;


function main() {
    localStorage.removeItem("username");
    const [userForm, messageForm] = document.querySelectorAll('form');
    const [usernameInput, messageInput] = document.querySelectorAll("input");
    const [_, messageFormSubmit] = document.querySelectorAll('button');

    [messageFormSubmit, messageInput].forEach(elem => elem.disabled = true);

    const socket = io();
    initializeSocketListeners(socket);

    userForm.addEventListener('submit', e => {
        e.preventDefault();
        const username = usernameInput.value;
        if (!username) return;

        localStorage.setItem("username", username);
        usernameInput.disabled = true;
        [messageFormSubmit, messageInput].forEach(elem => elem.disabled = false);
        messageInput.focus();
    });

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value;
        const username = localStorage.getItem("username");

        if (!message) return;

        socket.emit('newMessage', {
            from: username,
            text: message,
            createdAt: Date.now()
        });
        messageInput.value = '';
    });

    messageInput.addEventListener('input', () => {
        const username = localStorage.getItem("username");
        const message = `${username} is typing...`;
        socket.emit("typing", message);
    });
}


function initializeSocketListeners(socket) {
    socket.on('newMessage', (message) => {
        renderMessage(message);
    });

    socket.on('typing', message => {
        showIsTypingMessage(message);
    })
}


function renderMessage(message) {
    const li = document.createElement('li');

    const currentUser = localStorage.getItem("username");
    li.className = message.from === currentUser ? 'my-message' : 'other-message';

    li.textContent = `${message.from}: ${message.text}`;
    // Append first so it's in the DOM
    const messagesList = document.getElementById('messages');
    messagesList.appendChild(li);

    // Optional: Scroll to bottom when a new message arrives
    messagesList.scrollTop = messagesList.scrollHeight;
}


function showIsTypingMessage(message) {
    const typingPara = document.querySelector("#typing");
    typingPara.textContent = message;
    typingPara.classList.add("active");

    clearTimeout(typingPara.timeoutId);

    typingPara.timeoutId = setTimeout(() => {
        typingPara.classList.remove("active");
        typingPara.textContent = "";
    }, 2000);
}
