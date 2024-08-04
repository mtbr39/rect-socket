const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;
const players = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);
    
    // 新しいプレイヤーの初期位置を設定
    players[socket.id] = { x: 50, y: 50, id: socket.id };

    // 他のクライアントに新しいプレイヤーを通知
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // 新しいクライアントに既存のプレイヤーを通知
    socket.emit('currentPlayers', players);

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnect', socket.id);
    });

    socket.on('playerMove', (position) => {
        if (players[socket.id]) {
            players[socket.id].x = position.x;
            players[socket.id].y = position.y;
            io.emit('playerMoved', players[socket.id]);
        }
    });

    // プレイヤーのテキスト更新イベント
    socket.on('playerText', (text) => {
        if (players[socket.id]) {
            players[socket.id].text = text.text;
            io.emit('playerText', { id: socket.id, text: text.text });
        }
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
