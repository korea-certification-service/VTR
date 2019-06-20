const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
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

module.exports = router;