const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const mongoose = require("mongoose");
require('dotenv').config();
// require router
const indexRouter = require('./routes/index');
const socketsRouter = require('./routes/socket');
const cors = require('cors');

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
app.use(cors());

app.use("/img",express.static(__dirname+'/public/img'));
app.use("/css",express.static(__dirname+'/public/css'));
app.use("/js",express.static(__dirname+'/public/js'));

mongoose.set('useCreateIndex', true);

// Node.js의 native Promise 사용
mongoose.Promise = global.Promise;

// CONNECT TO MONGODB SERVER
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
.then(() => console.log('Successfully connected to mongodb'))
.catch(e => console.error(e));

app.use('/todos', require('./routes/todos'));

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
app.use('/vtr', socketsRouter);

// API문서: https://socket.io/docs/server-api/
// socket
app.io = require("socket.io")({
  'pingInterval': 100000,
  'pingTimeout': 50000
});

let service_socket = require("./service/service_socket");
service_socket.eventBinding(app);

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
