var express = require('express')
var parseurl = require('parseurl')
var session = require('express-session') // 미들웨어를 모듈로 설치
var FileStore = require('session-file-store')(session)

var app = express()

app.use(session({ // 사용자의 요청이 있을 때마다(모든 요청. 따로 매개변수로 정해두지 않았으므로) 미들웨어 실행. session 함수 실행
  // 아래 옵션들에 따라 세션이 동작하는 방법이 달라짐
  secret: 'keyboard cat', // required but credential
  resave: false, // 세션 데이터가 바뀌기 전까지 세션 저장소에 값을 저장하지 않음. true라면 값이 바뀌든 안바뀌든 항상 저장 ( 아직 이해 어려움 )
  saveUninitialized: true // 세션이 필요하기 전까지는 구동시키지 않음. false면 항상 세션 구동(서버에 부담)
  store : New FileStore() // option 추가 가능
}))

app.get('/', function (req, res, next) {
  console.log(req.session);
  if(req.session.num === undefined) {
    req.session.num = 1;
  } else {
    req.session.num = req.session.num + 1;
  }
  res.send(`Views : ${req.session.num}`); // 세션은 내부적으로 이 값을 세션 저장소에 저장. 그 정보는 memorystore에 저장되는데, 휘발성임(브라우저 끄면 초기화)
})

app.listen(3000)
