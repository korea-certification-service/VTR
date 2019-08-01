const moment = require('moment-timezone'); // 서버시간과 무관하게 한국시간으로 설정 가능
const request = require('request');

function eventBinding(app){
	let count = 0;
	let rooms = [];   
	let arrData = [];
	let seoulTime = moment.tz("Asia/Seoul");

	function getMsgTime() {
    moment.locale(); 
    let msgtime = moment().format('LT');

    /* deprecated: 기존 한국 시간 구하는 노가다 소스
    let d = new Date();
    let time = d.getHours() + "";
    if (time > 12) {
      time = "" + (time - 12);
    if (time.length == 1) time = "0" + time;
      time = "오후 " + time;
    } else {
    if (time.length == 1) time = "0" + time;
      time = "오전 " + time;
    }
    let minute = d.getMinutes() + "";
    if (minute.length == 1) minute = "0" + minute;
    let msgtime = time + ":" + minute;
    */
    return msgtime;
	}

	// 웹소켓 연결
	app.io.sockets.on("connection", function(socket) {
    console.log("******** [EVENT] sockets connection ********");

    socket.on("joinroom", function(data) {
      /* deprecated: 기존 한국 시간 구하는 노가다 소스
		let d = new Date();
		let yy = d.getFullYear();
		let mm = "" + (d.getMonth()+1);
		let dd = "" + d.getDate();
		if(mm.length == 1) mm = "0" + mm;
		if(dd.length == 1) dd = "0" + dd;
		let yymmdd = yy + "년 " + mm + "월 " + dd + "일";
		console.log("[EVENT] joinroom :" + data.room + d.getHours() + ":" + d.getMinutes());
		*/

      let seoulTimeFormat = seoulTime.format("YY년 MM월 DD일 HH:mm:ss"); // 한국 시간 한글 포맷
      moment.locale();
      let localTimeFormat = moment().format("LLL"); // 그 지역 시간 영어 포맷
      let timeFormat = seoulTimeFormat;
      console.log(`[EVENT] joinroom : ${timeFormat}`);

      socket.join(data.room);

      // depracated
      // socket.set('room', data.room);
      let room = data.room;
      socket.room = room;

      let nickname = data.userId;
      socket.nickname = nickname;

      console.log("재접속 여부:", data.reconnect);
      if (!data.reconnect) {
        // nickname 화면으로 내림
        socket.emit("new_user", { nickname: nickname, yymmdd: timeFormat });
        data = { msg: nickname + " 님이 입장하셨습니다." };
        app.io.sockets.to(room).emit("system_msg", data);
      }

      // Create Room
      if (rooms[room] == undefined) {
        console.log("room create :" + room);

        rooms[room] = new Object();
        rooms[room].socket_ids = new Object();
      }

      // Store current user's nickname and socket.id to MAP
      rooms[room].socket_ids[nickname] = socket.id;

      let users = Object.keys(rooms[room].socket_ids);
      // broadcast changed user list in the room
      app.io.sockets.to(room).emit("userlist", { users: users });

      count++;
    });

    // 접속해제시
    socket.on("disconnect", function(reason) {
      //var d = new Date();
      let room = socket.room;
      let nickname = socket.nickname;

      console.log(nickname + " disconnect reason: " + reason);

      // 접속해지시에 userlist에서 지워야할지 놓고 고민할 것

      // 각 연결해제된 사유에 따른 분기
      switch (reason) {
        case "ping timeout": // [Client Side] Client stopped responding to pings in the allowed amount of time
          console.log("@@@@@@@ ping timeout @@@@@@@");
          break;
        case "transport close": // [Client Side] Client stopped sending data
          console.log("@@@@@@@ transport close @@@@@@@");
          let data = {
            who: "computer",
            msg: nickname + " 님이 나가셨습니다."
          };
          app.io.sockets.to(room).emit("system_msg", data);
          //app.io.sockets.to(room).emit("userlist", { users: Object.keys(rooms[room].socket_ids) });
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
        console.log("##### disconnect #####: " + nickname);

        if (nickname != undefined) {
          if (
            rooms[room].socket_ids != undefined &&
            rooms[room].socket_ids[nickname] != undefined
          ) {
            delete rooms[room].socket_ids[nickname];
          }
        }
      } else {
        //Error
        console.log("##### try reconnect #####: " + nickname);
        app.io.sockets.to(room).emit("reconnect", {});
      }
    });

    // 메세지 전송시
    socket.on("send_msg", function(data) {
      let room = socket.room;
      data.msgtime = getMsgTime();

      if (room != undefined && rooms[room] != undefined) {
        let nickname = socket.nickname;

        //console.log("[EVENT] send_msg: ", data);

        if (nickname != undefined) {
          let arrUser = Object.keys(rooms[room].socket_ids);
          // room 저장
          data.room = socket.room;

          // 배열에 메세지 저장
          arrData.push(data);

          let len = arrData.length;

          if (len > 1) {
            if (arrData[len - 1].who === arrData[len - 2].who) {
              data.sameUser = true;
              console.log("동일 인물 메세지", len, arrData[len - 1]);
            } else {
              data.sameUser = false;
              console.log("새로운 메세지.", len, arrData[len - 1]);
            }
          }

          if (data.who === socket.nickname) {
            // 보낸 대상이 나
            socket.broadcast.to(room).emit("other_msg", data);
          } else {
            // 보낸 대상이 다른 누군가
            socket.broadcast.to(room).emit("broadcast_msg", data);
          }
          //자기자신 전송
          socket.emit("broadcast_msg", data);

          /*
          if (data.to == "ALL") {
            socket.broadcast.to(room).emit("broadcast_msg", data);
            // 자신을 제외하고 다른 클라이언트에게 보냄
          } else {
            // 귓속말
            socket_id = rooms[room].socket_ids[data.to];
            if (socket_id != undefined) {
              data.msg = "귓속말 :" + data.msg;
              app.io.sockets.to(socket_id).emit("broadcast_msg", data);
            }
          }
          */

          // 배열 형태로 보내야 저장되게 되있는 구조
          let arrMsgs = new Array(1);
          arrMsgs[0] = data;
          let reqData = {
            room: socket.room,
            msgs: arrMsgs
          };

          const options = {
            uri: "http://192.168.0.10:4000/vtr/setChat", // 로컬에 저장
            method: "POST",
            body: reqData,
            json: true
          };

          // 로직 완성될때까지 메세지 디비 저장 막기
          /*
          request.post(options, function(err, response, body) {
            if (err !== null) {
            }
          });
          */          
        }
      } else {
        console.log("[Error] room이나 rooms[room]이 undefined");
      }
    });

    // 거래관련
    socket.on("trade", function(data) {
      let room = socket.room;
      data.msgtime = getMsgTime();
      console.log("[EVENT] trade");
      console.dir(data);

      data.type = "basic";
      if (data.who === data.sellerTag) { 
        data.target = "seller"; // 판매자
        if (data.command === 1 || data.command === 1.1 || data.command === 3 || data.command === 3.1 || data.command === 5 || data.command === 5.1) {
          socket.broadcast.to(room).emit("trade_seller", data);
          data.flagNum = data.command;
        } else {
          data.type = "err";
        }
        socket.emit("trade_seller", data);

      } else if (data.who === data.buyerTag){ 
        data.target = "buyer"; // 구매자
        if (data.command === 2 || data.command === 2.1|| data.command === 4 || data.command === 4.1 || data.command === 5 || data.command === 5.1) {
          socket.broadcast.to(room).emit("trade_buyer", data);
          data.flagNum = data.command;
        } else {
          data.type = "err";
        }
        socket.emit("trade_buyer", data);

      }

      // 거래관련 정보도 배열에 메세지 저장 해야할지??
      //arrData.push(data);
      //console.dir(arrData);
    });

    // Deprecated: 메세지 DB 저장 API 호출 방식
    socket.on("saveDB", function(data) {
      let reqData = {
        room: socket.room,
        msgs: arrData // msgs담는 방식 실시간으로 바꿔야함
      };

      const options = {
        uri: "http://localhost:4000/vtr/setChat",
        method: "POST",
        body: reqData,
        json: true
      };

      request.post(options, function(err, response, body) {
        if (err !== null) {
        }
      });
    });

    // 메세지 DB 불러오기 API 호출 방식
    socket.on("loadDB", function(data) {
      request.get({ uri: "http://localhost:4000/vtr/getChat" }, function(
        err,
        response,
        body
      ) {
        if (err !== null) {
          console.log(response);
        }
      });
    });

    // 빼버릴 로직: 이름 바꾸기 안할
    socket.on("changename", function(data) {
      console.log("changename - " + data.nickname);

      //let room = data.room;
      let room = socket.room;

      // if(room){
      if (room != undefined && rooms[room] != undefined) {
        let nickname = data.nickname;

        if (nickname != undefined) {
          let pre_nick = socket.nickname;
          console.log("pre_nick - " + pre_nick);

          // if user changes name get previous nickname from nicknames MAP
          if (pre_nick != undefined) {
            delete rooms[room].socket_ids[pre_nick];
          }

          rooms[room].socket_ids[nickname] = socket.id;
          socket.nickname = nickname;

          //바뀐 이름 Broadcast
          data = {
            msg:
              pre_nick + " 님이 " + nickname + "으로 대화명을 변경하셨습니다."
          };
          app.io.sockets.to(room).emit("broadcast_msg", data);

          // send changed user nickname lists to clients
          app.io.sockets.to(room).emit("userlist", { users: Object.keys(rooms[room].socket_ids) });
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