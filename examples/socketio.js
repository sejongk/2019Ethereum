//https://kamang-it.tistory.com/entry/NodeJSSocketIOSocketIO-%EB%A9%80%ED%8B%B0-%ED%86%B5%EC%8B%A0-%EB%8B%A4%EC%A4%91-%ED%86%B5%EC%8B%A0-serverclient-2?category=746442

// app.js의 본문내에 삽입하시면 된다.
var http = require('http').Server(app);
var io = require('socket.io')(http);
var roomName;

io.on('connection', function (socket) {
    console.log('connect');
    var instanceId = socket.id;

    socket.on('joinRoom',function (data) {
        console.log(data);
        socket.join(data.roomName); ///방 이름이 roomName인 방에 join
        roomName = data.roomName;
    });

    socket.on('reqMsg', function (data) {
        console.log(data);
        io.sockets.in(roomName).emit('recMsg', {comment: instanceId + " : " + data.comment+'\n'}); //해당 방에 있는 사람들에게 msg 전송
        io.to(instanceId).emit('ser_curInfo', {}); // 특정 id인 사람에게만 msg 전송
        socket.emit("msg", {}); //모든 사람에게 전송


    })
});

http.listen(3000, function(){
    console.log('listening on *:3000');
  });

