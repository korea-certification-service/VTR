const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const mongoose = require("mongoose");
// require router
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const socketsRouter = require('./routes/socket');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/img",express.static(__dirname+'/public/img'));
app.use("/css",express.static(__dirname+'/public/css'));
app.use("/js",express.static(__dirname+'/public/js'));

// session
app.use(
  session({
    secret: "@#@$MYSIGN#@$#$",
    resave: false,
    saveUninitialized: true
  })
);

// router
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/socket', socketsRouter);

// API문서: https://socket.io/docs/server-api/
// socket
app.io = require("socket.io")({
  'pingInterval': 10000,
  'pingTimeout': 5000
});

var count = 0;
var rooms = [];

var service_socket = require("./service/service_socket");
service_socket.eventBinding(app);
/*
// 웹소켓 연결
app.io.sockets.on("connection", function(socket) {
  console.log("******** sockets connection ********");

  socket.on("joinroom", function(data) {
    var d = new Date();
    console.log("joinroom :" + data.room + d.getHours() + ":" + d.getMinutes());
    socket.join(data.room);

    // depracated
    // socket.set('room', data.room);
    let room = data.room;
    socket.room = room;

    //let nickname = "손님-" + count;
    let nickname = data.userId;

    socket.nickname = nickname;

    // nickname 화면으로 내림
    socket.emit("new", { nickname: nickname });

    // Create Room
    if (rooms[room] == undefined) {
      console.log("room create :" + room);

      rooms[room] = new Object();
      rooms[room].socket_ids = new Object();
    }

    // Store current user's nickname and socket.id to MAP
    rooms[room].socket_ids[nickname] = socket.id;

    console.log("재접속 여부:", data.reconnect)
    if(!data.reconnect) {
        data = { msg: nickname + " 님이 입장하셨습니다." };
        app.io.sockets.to(room).emit("broadcast_msg", data);
    }

    // broadcast changed user list in the room
    app.io.sockets.to(room).emit("userlist", { users: Object.keys(rooms[room].socket_ids) });

    count++;
  });

  // 접속해제시
  socket.on("disconnect", function(reason) {
    var d = new Date();
    let room = socket.room;
    let nickname = socket.nickname;

    console.log(nickname + " disconnect reason: " + reason);

    // 각 연결해제된 사유에 따른 분기
    switch (reason) {
        case "ping timeout": // [Client Side] Client stopped responding to pings in the allowed amount of time
            console.log("@@@@@@@ ping timeout @@@@@@@");
            break;
        case "transport close": // [Client Side] Client stopped sending data
            console.log("@@@@@@@ transport close @@@@@@@");
            let data = { msg: nickname + " 님이 나가셨습니다." };
            app.io.sockets.to(room).emit("broadcast_msg", data);
            app.io.sockets.to(room).emit("userlist", { users: Object.keys(rooms[room].socket_ids) });
            break;
        case "client namespace disconnect": // [Client Side] Got disconnect packet from client
            console.log("@@@@@@@ client namespace disconnect @@@@@@@");
            break;			
        case "transport error": // [Server  Side] Transport error
            console.log("@@@@@@@ transport error @@@@@@@");
            break;			
        case "server namespace disconnect": // [Server  Side] Server performs a socket.disconnect()
            console.log("@@@@@@@ server namespace disconnect @@@@@@@");
            break;			
        default:
            break;
    }

    if (room != undefined && rooms[room] != undefined) {
        console.log("##### disconnect #####: "+nickname+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds());

        // 여기에 방을 나갔다는 메세지를 broad cast 하기
        if (nickname != undefined) {
            if (rooms[room].socket_ids != undefined &&rooms[room].socket_ids[nickname] != undefined){
                delete rooms[room].socket_ids[nickname];
            }
        }
    } else {
        //Error
        console.log("##### try reconnect #####: "+nickname+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds());
        app.io.sockets.to(room).emit("reconnect", {});
    }
  });

  // 메세지 전송시
  socket.on("send_msg", function(data) {
    console.log("DH : send_msg");

    let room = socket.room;

    if (room != undefined && rooms[room] != undefined) {
      let nickname = socket.nickname;

      if (nickname != undefined) {
        data.msg = nickname + " : " + data.msg;

        console.log("in send msg room is " + room + data.msg);

        if (data.to == "ALL")
          socket.broadcast.to(room).emit("broadcast_msg", data);
        // 자신을 제외하고 다른 클라이언트에게 보냄
        else {
          // 귓속말
          socket_id = rooms[room].socket_ids[data.to];
          if (socket_id != undefined) {
            data.msg = "귓속말 :" + data.msg;
            app.io.sockets.to(socket_id).emit("broadcast_msg", data);
          } // if
        }

        //자기자신 전송
        socket.emit("broadcast_msg", data);
      }
    } else {
      //Error
    }
  });

  // 빼버릴 로직: 이름 바꾸기 안할 
  socket.on("changename", function(data) {
    console.log("DH : changename - " + data.nickname);

    //let room = data.room;
    let room = socket.room;

    // if(room){
    if (room != undefined && rooms[room] != undefined) {
      let nickname = data.nickname;

      if (nickname != undefined) {
        let pre_nick = socket.nickname;
        console.log("DH : pre_nick - " + pre_nick);

        // if user changes name get previous nickname from nicknames MAP
        if (pre_nick != undefined) {
          delete rooms[room].socket_ids[pre_nick];
        }

        rooms[room].socket_ids[nickname] = socket.id;
        socket.nickname = nickname;

        //DH : 바뀐 이름 Broadcast
        data = {
          msg: pre_nick + " 님이 " + nickname + "으로 대화명을 변경하셨습니다."
        };
        app.io.sockets.to(room).emit("broadcast_msg", data);

        // send changed user nickname lists to clients
        app.io.sockets
          .to(room)
          .emit("userlist", { users: Object.keys(rooms[room].socket_ids) });
      } else {
        //Error
      }
    } else {
      //Error
    }
  });  
});
*/



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
