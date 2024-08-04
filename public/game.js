const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io();

let players = {};
let currentPlayer = { id: null, x: 50, y: 50, text: '' };

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
        currentPlayer.x = x;
        currentPlayer.y = y;
        socket.emit('playerMove', { x, y });
    }
});

// キーボード入力イベント
chatInputElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && chatInputElement.value.trim()) {
        currentPlayer.text = chatInputElement.value;
        socket.emit('playerText', { text: chatInputElement.value });
        chatInputElement.value = '';
        chatBox.visible = false;
        chatInputElement.style.top = '-100px';
        chatInputElement.style.left = '-100px';
        draw();
    }
});

// マウスのクリックでカーソル位置を設定
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (chatBox.visible && isPointInside(x, y, chatBox)) {
        // 文字幅8pxと仮定してカーソル位置を設定
        const cursorX = x - chatBox.x;
        chatInputElement.selectionStart = Math.floor(cursorX / 8);
        chatInputElement.selectionEnd = chatInputElement.selectionStart;
        draw();
    }
});

socket.on('currentPlayers', (serverPlayers) => {
    players = serverPlayers;
    currentPlayer.id = socket.id;
});

socket.on('newPlayer', (newPlayer) => {
    players[newPlayer.id] = newPlayer;
});

socket.on('playerMoved', (movedPlayer) => {
    players[movedPlayer.id] = movedPlayer;
    draw();
});

socket.on('playerText', (playerText) => {
    if (players[playerText.id]) {
        players[playerText.id].text = playerText.text;
        draw();
    }
});

socket.on('playerDisconnected', (id) => {
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
        ctx.fillRect(player.x - 25, player.y - 25, 50, 50);
        if (player.text) {
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.fillText(player.text, player.x - ctx.measureText(player.text).width / 2, player.y - 30);
        }
    }

    // チャットボタンの描画
    ctx.fillStyle = '#007bff';
    ctx.fillRect(chatButton.x, chatButton.y, chatButton.width, chatButton.height);
    ctx.fillStyle = 'white';
    ctx.fillText('Chat', chatButton.x + 5, chatButton.y + 15);
}

draw();
