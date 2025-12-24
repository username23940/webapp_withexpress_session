var express = require('express');
var router = express.Router();
var fs = require('fs');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
var helmet = require('helmet');
app.use(helmet());
var session = require('express-session'); // 여기서 세션 생성하니까 여기만 필요
var FileStore = require('session-file-store')(session)

var authData = {
  email : 'hi@gmail.com', 
  password : '1111',
  nickname : 'hi'
}

router.get("/login", (request, response) => 
        var title = 'WEB - create';
        var list = template.list(request.list);
        var html = template.HTML(title, list, `
          <form action="/auth/login_process" method="post">
            <p><input type="text" name="email" placeholder="email"></p>
            <p><input type="password" name="pwd" placeholder="password"></p>
            <p><input type="submit" value = 'login'></p>
          </form>
        `, '');
        response.send(html);
);

router.post("/login_process", (request, response) =>  // form 에서 post 방식으로 전송했기 때문 
   var post = request.body;
   var email = post.email;
   var passowrd = post.pwd;
   if(email === authData.email && pwd === authData.password) { // authData가 db라고 가정하면 db의 데이터와 일치하는지 확인하고, session 추가
     request.session.is_logined = true;
     request.session.nickname = authData.nickname;
     request.session.save(function(err) { // session 객체의 정보를 저장소에 바로 저장 후 , 콜백으로 리디렉션
       response.redirect('/');
     })
   } else {
     response.send('Who?')
   }
);

router.get("/logout", (request, response) => 
  request.session.destroy(function(err){ // 이 콜백은 세션의 호출이 끝난 다음에 실행되도록 약속
    response.redirect('/');
  });
);

module.exports = router;
