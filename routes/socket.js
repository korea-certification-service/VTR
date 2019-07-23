const express = require('express');
const Chat = require('../model/chat');
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

// VTR
router.get("/vtr/:room", function(req, res) {
  let session = req.session;
  console.log("현재 세션 정보", session.user);
  console.log("room name is :" + req.params.room);

  if (session.user !== undefined) {
    res.render("vtr", { room: req.params.room, userId: session.user.id });
  } else {
    res.redirect("/login");
  }
});

// 채팅 저장
router.post('/saveChat', (req, res) => {
  Chat.create(req.body)
    .then(chat => res.send(chat))
    .catch(err => res.status(500).send(err));
});

module.exports = router;