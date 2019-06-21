
// app.io = require("socket.io")({
//     'pingInterval': 2000,
//     'pingTimeout': 5000
//   });  
function eventBinding(app){
    let count = 0;
    let rooms = [];   
    let arrData = [];
    // 웹소켓 연결
    app.io.sockets.on("connection", function(socket) {
      console.log("******** [EVENT] sockets connection ********");
    
      socket.on("joinroom", function(data) {
        let d = new Date();
        let yy = d.getFullYear();
        let mm = "" + (d.getMonth()+1);
        let dd = "" + d.getDate();
        if(mm.length == 1) mm = "0" + mm;
        if(dd.length == 1) dd = "0" + dd;
        let yymmdd = yy + "년 " + mm + "월 " + dd + "일";

        console.log("[EVENT] joinroom :" + data.room + d.getHours() + ":" + d.getMinutes());
        socket.join(data.room);
    
        // depracated
        // socket.set('room', data.room);
        let room = data.room;
        socket.room = room;
    
        //let nickname = "손님-" + count;
        let nickname = data.userId;
    
        socket.nickname = nickname;
    
        // nickname 화면으로 내림
        socket.emit("new", { nickname: nickname, yymmdd: yymmdd });
    
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
            app.io.sockets.to(room).emit("system_msg", data);
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
                let data = { who: "computer", msg: nickname + " 님이 나가셨습니다." };
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
        let room = socket.room;
        let d = new Date();
        let time = d.getHours();
        if(time > 12){
          time = "오후 " + (time - 12);
        } else {
          time = "오전 " + time;
        }
        let msgtime = time+":"+d.getMinutes();
        data.msgtime = msgtime;

        if (room != undefined && rooms[room] != undefined) {
          let nickname = socket.nickname;

          console.log("[EVENT] send_msg: ", nickname);

          if (nickname != undefined) {
            //data.msg = nickname + " : " + data.msg;
            console.dir(data);
            console.dir();

            let arrUser = Object.keys(rooms[room].socket_ids);

            arrData.push(data);

            let len = arrData.length;

            if(len > 1) {
              if(arrData[len-1].who === arrData[len-2].who) {
                data.sameUser = true;
                console.log("동일 인물 메세지", len, arrData[len-1])
              } else {
                data.sameUser = false;
                console.log("새로운 메세지.", len, arrData[len-1])
              }
            }

            if(data.who === socket.nickname) { // 보낸 대상이 나
              socket.broadcast.to(room).emit("other_msg", data);
            } else { // 보낸 대상이 다른 누군가
              socket.broadcast.to(room).emit("broadcast_msg", data);
            }


            /*
            if (data.to == "ALL")
              socket.broadcast.to(room).emit("broadcast_msg", data);
            // 자신을 제외하고 다른 클라이언트에게 보냄
            else {
              // 귓속말
              socket_id = rooms[room].socket_ids[data.to];
              if (socket_id != undefined) {
                data.msg = "귓속말 :" + data.msg;
                app.io.sockets.to(socket_id).emit("broadcast_msg", data);
              }
            }
            */
    
            //자기자신 전송
            socket.emit("broadcast_msg", data);
          }
        } else {
          //Error
        }
      });
    
      // 거래관련 
      socket.on("trade", function(data) {

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
    
}
exports.eventBinding = eventBinding;