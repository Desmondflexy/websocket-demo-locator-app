document.addEventListener('DOMContentLoaded', main);

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
        messageInput.disabled = false;
        messageInput.focus();
    });

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value;
        if (!message) return;

        const username = localStorage.getItem("username");
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

        if (messageInput.value)
            messageFormSubmit.disabled = false
    });
}


function initializeSocketListeners(socket) {
    socket.on('newMessage', (message) => {
        renderMessage(message);
    });

    socket.on('typing', message => {
        showIsTypingMessage(message);
    });

    socket.on('receiveMessage', playReceiveSound);
}


function renderMessage(message) {
    const li = document.createElement('li');

    const currentUser = localStorage.getItem("username");
    const isMine = message.from === currentUser;
    const displayName = isMine ? 'You' : message.from;
    li.className = isMine ? 'my-message' : 'other-message';

    const time = new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    li.innerHTML = `
        <div class="username">${displayName}</div>
        <div class="message-bubble">
            <div class="message-text">${message.text}</div>
            <div class="timestamp">${time}</div>
        </div>
    `;

    const messagesList = document.getElementById('messages');
    messagesList.appendChild(li);
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

function playReceiveSound() {
    const sound = document.getElementById('receive-sound');
    sound.play();
}
