document.addEventListener('DOMContentLoaded', main);

function main() {
    let username, recipient;
    localStorage.removeItem("username");
    const [userForm, messageForm] = document.querySelectorAll('form');
    const [usernameInput, recipientInput, messageInput] = document.querySelectorAll("input");
    const [_, messageFormSubmit] = document.querySelectorAll('button');
    const infoPara = document.querySelector("#info");

    [messageFormSubmit, messageInput].forEach(elem => elem.disabled = true);

    const socket = io();
    initializeSocketListeners();

    userForm.addEventListener('submit', e => {
        e.preventDefault();
        username = usernameInput.value;
        recipient = document.getElementById("recipient-input").value;
        if (!username || !recipient) return;

        localStorage.setItem("username", username);
        socket.emit("register", username);

        usernameInput.disabled = true;
        recipientInput.disabled = true;
        messageInput.disabled = false;
        messageInput.focus();
    });

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = messageInput.value;
        if (!text) return;

        const message = {
            from: username,
            text,
            createdAt: Date.now()
        };

        renderMessage(message);
        socket.emit('privateMessage', {
            to: recipient,
            message
        });

        messageInput.value = '';
    });

    messageInput.addEventListener('input', () => {
        if (messageInput.value) {
            socket.emit("typing", {
                to: recipient,
                message: `${username} is typing...`
            });
            messageFormSubmit.disabled = false;
        }
    });

    function initializeSocketListeners() {
        socket.on('newMessage', (message) => {
            renderMessage(message);
        });

        socket.on('typing', message => {
            showInfoText(message);
        });

        socket.on('receiveMessage', playReceiveSound);

        socket.on('newUser', message => {
            showInfoText(message);
        })
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

    function showInfoText(message) {
        infoPara.textContent = message;
        infoPara.classList.add("active");

        clearTimeout(infoPara.timeoutId);

        infoPara.timeoutId = setTimeout(() => {
            infoPara.classList.remove("active");
            infoPara.textContent = "";
        }, 2000);
    }

    function playReceiveSound() {
        const sound = document.getElementById('receive-sound');
        sound.play();
    }
}
