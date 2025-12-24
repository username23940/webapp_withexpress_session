const express = require("express") // express 에는 다른 것이 들어올 일이 없으니까, 저 이름의 값이 바뀌지 않도록 고정(const로)
const app = express() // express를 호출. app 객체를 담음. 
const compression = require('compression');
var fs = require('fs');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
var bodyParser = require("body-parser");

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
var authRouter = require('./routes/auth');
// modules

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: False}));
app.use(compression()); 
app.use(session({ 
  secret: 'keyboard cat', 
  resave: false, 
  saveUninitialized: true ,
  store : New FileStore() 
}))

app.get('*', function(request, response, next{ // get 방식으로 들어오는 모든 요청에 대해서만 작동
     fs.readdir('./data', function(error, filelist){
          request.list=filelist; // request 객체의 list 변수를 filelist의 값으로 줌
          next(); // 3번째 인자를 실행. next에는 그다음에 호출되어야 할 미들웨어가 담겨져 있음(지금은 없음)
     });
});

app.use('/', indexRouter); // 첫번째 인자 : 기본 url, 두번째 인자 : 사용할 미들웨어
app.use('/topic', topicRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
})
app.use((err, req, res, next) => { // 첫번째 매개변수 : next를 통해 전달 받을 에러 데이터
  console.error(err.stack)
  res.status(500).send('Something broke!')
}) // express에서 매개변수가 4개인 콜백함수는 에러 핸들러를 위한 미들웨어로 약속. 
// 그래서 페이지가 찾을 수 없는 경우 next(err)가 호출되면 그 다음에 어떤 미들웨어가 오든 전부 무시후 4개 매개변수인 미들웨어 호출.

 app.listen(3000, () => console.log("Example App listening on port 3000!"))
// 웹서버가 실행되면서 3000번 포트 리스닝, 성공시 console 출력
