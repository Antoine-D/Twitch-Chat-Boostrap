var app = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('chat message', function (messageReceived) {
        console.log('chat message received: ' + JSON.stringify(messageReceived));
        io.sockets.emit('chat message', messageReceived);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});