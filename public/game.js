const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io();

let players = {};
let currentPlayer = { id: null, position: { x: 50, y: 50 }, chatText: '' };

const chatButton = { x: canvas.width - 80, y: canvas.height - 30, width: 60, height: 20 };
const chatBox = { x: chatButton.x, y: chatButton.y - 50, width: 60, height: 40, visible: false };
const chatInputElement = document.getElementById('chatInput');

// Canvasクリックイベント
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // チャットボタンがクリックされた場合
    if (isPointInside(x, y, chatButton)) {
        chatBox.visible = !chatBox.visible;
        if (chatBox.visible) {
            chatInputElement.style.top = (chatButton.y - chatBox.height) + 'px';
            chatInputElement.style.left = chatButton.x + 'px';
            chatInputElement.focus();
            chatInputElement.value = '';
        } else {
            chatInputElement.blur();
            chatInputElement.style.top = '-100px';
            chatInputElement.style.left = '-100px';
        }
        draw();
        return;
    }

    // チャットボックスが表示されていない場合、通常のクリック処理を行う
    if (!chatBox.visible) {
        currentPlayer.position.x = x;
        currentPlayer.position.y = y;
        socket.emit('updateUserData', { position: { x, y } });
    }
});

// キーボード入力イベント
chatInputElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && chatInputElement.value.trim()) {
        currentPlayer.chatText = chatInputElement.value;
        socket.emit('updateUserData', { chatText: chatInputElement.value });
        chatInputElement.value = '';
        chatBox.visible = false;
        chatInputElement.style.top = '-100px';
        chatInputElement.style.left = '-100px';
        draw();
    }
});

socket.on('currentUserData', (serverUserData) => {
    players = serverUserData;
    currentPlayer.id = socket.id;
});

socket.on('userDataUpdated', (updatedUser) => {
    players[updatedUser.id] = updatedUser.data;
    draw();
});

socket.on('userDisconnected', (id) => {
    delete players[id];
    draw();
});

function isPointInside(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // プレイヤーの描画
    for (let id in players) {
        const player = players[id];
        ctx.fillStyle = player.id === currentPlayer.id ? 'blue' : 'red';
        ctx.fillRect(player.position.x - 25, player.position.y - 25, 50, 50);
        if (player.chatText) {
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.fillText(player.chatText, player.position.x - ctx.measureText(player.chatText).width / 2, player.position.y - 30);
        }
    }

    // チャットボタンの描画
    ctx.fillStyle = '#007bff';
    ctx.fillRect(chatButton.x, chatButton.y, chatButton.width, chatButton.height);
    ctx.fillStyle = 'white';
    ctx.fillText('Chat', chatButton.x + 5, chatButton.y + 15);
}

draw();
