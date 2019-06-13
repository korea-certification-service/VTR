var app = require('express')();
var server = require('http').createServer(app);
app.set('port', 4100);
// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);

// localhost:3000으로 서버에 접속하면 클라이언트로 index.html을 전송한다
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/msg.html');
});

// connection event handler
// connection이 수립되면 event handler function의 인자로 socket인 들어온다
io.on('connection', function(socket) {

  // 접속한 클라이언트의 정보가 수신되면
  socket.on('login', function(data) {
    console.log('Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid);

    // socket에 클라이언트 정보를 저장한다
    socket.name = data.name;
    socket.userid = data.userid;

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    io.emit('login', data.name );
  });

  // 클라이언트로부터의 메시지가 수신되면
  socket.on('chat', function(data) {
    console.log('Message from %s: %s', socket.name, data.msg);

    var msg = {
      from: {
        name: socket.name,
        userid: socket.userid
      },
      msg: data.msg
    };

    // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
    socket.broadcast.emit('chat', msg);

    // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
    // socket.emit('s2c chat', msg);

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    // io.emit('s2c chat', msg);

    // 특정 클라이언트에게만 메시지를 전송한다
    // io.to(id).emit('s2c chat', data);
  });

  // 클라이언트로부터의 거래프로세스 요구
  socket.on('trade', function(data) {
    console.log('Message from %s: %s', socket.name, data.msg);

    var btn = {
      from: {
        name: socket.name,
        userid: socket.userid
      },
      btn: {
        text: "거래시작",
        value: "trd_start",
      },
      msg: data.msg,
      status: 1,
      command: data.command,
    };


    var err = {
      className: "server_msg"     ,
      msg: "명령어가 올바르지 않습니다. 다시 확인하시고 입력해주세요.",
      status: 0 
    }
    // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
    if(data.msg === "거래시작") {
      socket.broadcast.emit('trade', btn);
    } else {
      socket.broadcast.emit('trade', err);
    }
  });

  // force client disconnect from server
  socket.on('forceDisconnect', function() {
    socket.disconnect();
  })

  socket.on('disconnect', function() {
    console.log('user disconnected: ' + socket.name);
  });
});

server.listen(app.get('port'), function() {
  console.log('Socket IO server listening on port ' + app.get('port'));
});