const express = require('express');
const router = express.Router();
const httpServer = require('../bin/www');
const app = express();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// API문서: https://socket.io/docs/server-api/
// socket
const io = require("socket.io")(httpServer, {
  'pingInterval': 2000,
  'pingTimeout': 5000
});

var count = 0;
var rooms = [];

// 채팅방
router.get("/chat/:room", function(req, res) {
  let session = req.session;
  console.log("현재 세션 정보", session.user);
  console.log("room name is :" + req.params.room);
  res.render("room", { room: req.params.room, userId: session.user.id });
});

// VTR
router.get("/vtr/:room", function(req, res) {
  let session = req.session;
  console.log("현재 세션 정보", session.user);
  console.log("room name is :" + req.params.room);
  res.render("vtr", { room: req.params.room, userId: session.user.id });
});

// 웹소켓 연결
io.sockets.on("connection", function(socket) {
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
        io.sockets.to(room).emit("broadcast_msg", data);
    }

    // broadcast changed user list in the room
    io.sockets.to(room).emit("userlist", { users: Object.keys(rooms[room].socket_ids) });

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
            io.sockets.to(room).emit("broadcast_msg", data);
            io.sockets.to(room).emit("userlist", { users: Object.keys(rooms[room].socket_ids) });
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
        io.sockets.to(room).emit("reconnect", {});
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
            io.sockets.to(socket_id).emit("broadcast_msg", data);
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
        io.sockets.to(room).emit("broadcast_msg", data);

        // send changed user nickname lists to clients
        io.sockets
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

module.exports = router;
