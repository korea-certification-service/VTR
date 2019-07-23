var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 채팅방 UI 템플릿
router.get("/temp", (req, res, next) => {
  res.render("template_chat", {});
});

// 판매자
router.get("/seller", (req, res, next) => {
    let session = req.session;
    session.user = {
        id: "tjdudwp02",
        authorized: true
    };    
    session.save();
    res.redirect("/socket/vtr/" + "tjdudwp02|testkcs|5d354b76969eb20ac8890f77");
});

// 구매자 로그인
router.get("/login", (req, res, next) => {
    res.render("login", {});
});

// 로그인 성공
router.post("/loginSuccess", (req, res, next) => {
  let session = req.session;

  if (session.user) {
    console.log("이미 로그인 됨", session.user);
    req.session.destroy(function(){ 
        req.session;
    });
  } else {
    console.log("로그인 안됨", session.user);
    session.user = {
      id: req.body.id,
      authorized: true
    };
    session.save();
  }
  res.redirect("/socket/vtr/" + "tjdudwp02|" + session.user.id + "|5d354b76969eb20ac8890f77");
});

module.exports = router;
