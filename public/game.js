const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io();

let players = {};
let currentPlayer = { id: null, x: 50, y: 50 };

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    currentPlayer.x = x;
    currentPlayer.y = y;
    
    socket.emit('playerMove', { x, y });
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
    drawPlayers();
});

socket.on('playerDisconnect', (id) => {
    delete players[id];
    drawPlayers();
});

function drawPlayers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let id in players) {
        const player = players[id];
        ctx.fillStyle = player.id === currentPlayer.id ? 'blue' : 'red';
        ctx.fillRect(player.x - 25, player.y - 25, 50, 50);
    }
}

drawPlayers();
