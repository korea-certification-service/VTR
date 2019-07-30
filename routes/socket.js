const express = require('express');
const Chat = require('../model/chat');
const config = require('../config/config');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect("/login");
});

// 채팅방: depracated
router.get("/chat/:room", function(req, res) {
  let session = req.session;
  console.log("현재 세션 정보", session.user);
  console.log("room name is :" + req.params.room);
  res.render("room", { room: req.params.room, userId: session.user.id });
});

// VTR wating
router.post("/waiting", function(req, res) {
  let reqBody = req.body;
  reqBody['token'] = config.APIToken;
  res.render("waiting", reqBody);
});

// VTR Room
router.post("/room/:room", function(req, res) {
  let reqBody = req.body;
  reqBody['token'] = config.APIToken;
  reqBody['chatbotURL'] = config.chatbotURL;
  reqBody['APIServer'] = config.APIServer;
  //res.render("vtr", { room: req.body.room, userId: req.body.userId });
  res.render("vtr", reqBody);
  /*
  let session = req.session;
  console.log("현재 세션 정보", session.user);
  console.log("room name is :" + req.params.room);

  if (session.user !== undefined) {
    res.render("vtr", { room: req.params.room, userId: session.user.id });
  } else {
    res.redirect("/login");
  }
  */
});

// 채팅 저장
router.post('/setChat', (req, res) => {
	console.log(req.body);

  Chat.createandUpdate(req.body)
    .then(chat => {
      res.status(200).send(chat)
    })
    .catch(err => {
      console.log(err)
      res.status(500).send(err)
    });
  // let data = req.body;
  // let chat = new Chat(data);
  // chat.save(function(err, result){
  //   if(err == null) {
  //     res.status(200).send(err);
  //   } else {
  //     res.status(500).send(result);
  //   }
  // })
});

// 채팅 가져오기
router.get('/getChat', (req, res) => {
  Chat.findAll()
  .then((chat) => {
    if (!chat.length) return res.status(404).send({ err: 'chat not found' });
    //res.status(200).send(`find successfully: ${chat}`);
    res.status(200).json(chat);
  })
  .catch(err => res.status(500).send(err));
});

module.exports = router;