/**
 * 웹소켓 테스트용 소스 및 외부API 호출
 * @author Jongmin Kim
 * @since 191121
 */
var express = require('express');
var router = express.Router();
let call_vtr = require('../util/call_vtr');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 채팅방 UI 템플릿
router.get("/temp", (req, res, next) => {
  res.render("template_chat", {});
});

/**
 * @deprecated only test
 * @description 판매자 접속 라우터
 */
router.get("/seller", (req, res, next) => {
    let session = req.session;
    session.user = {
        id: "tjdudwp02",
        authorized: true
    };    
    session.save();
    res.redirect("/vtr/room/" + "tjdudwp02|testkcs|5d354b76969eb20ac8890f77");
});

/**
 * @deprecated only test
 * @description 구매자 로그인 라우터
 */
router.get("/login", (req, res, next) => {
    res.render("login", {});
});

/**
 * @deprecated only test
 * @description 로그인 성공
 */
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
  res.redirect("/vtr/room/" + "tjdudwp02|" + session.user.id + "|5d354b76969eb20ac8890f77");
});

// 마켓마하 API서버 호출을 위한 라우터
router.post("/test/call-backend", (req, res, next) => {
  let body = req.body; 

  call_vtr.callVtr(body, function(result) {
    res.status(200).send(result);
  });
});

module.exports = router;