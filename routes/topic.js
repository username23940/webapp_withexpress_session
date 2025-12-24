var express = require('express');
var router = express.Router();
var fs = require('fs');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
var auth = require('../lib/auth.js');


router.get("/create", (request, response) => 
    if(!auth.isOwner)(request, response) {
        response.redirect('/');
        return false; // 나머지 뒤의 코드를 실행되지 않게 함(로그인 안돼있으니까)
    }
    var title = 'WEB - create';
    var list = template.list(request.list); // main.js의 indexRouter 미들웨어로 쓰는 부분 바로 윗코드
    var html = template.HTML(title, list, `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '', auth.statusUI(request, response)); // auth.js에서 isOwner 검사하고 반환한 값. 
    response.send(html);
);

router.post("/create_process", (request, response) =>  // form 에서 post 방식으로 전송했기 때문 
     var post = request.body;
     var title = post.title;
     var description = post.description;
     fs.writeFile(`data/${title}`, description, 'utf8', function(err){
       response.writeHead(302, {Location: `/?id=${title}`});
       response.end();
       response.redirect(`/page/${title}`);
);

router.get("/update/:pageId", (request, response) =>
    if(!auth.isOwner)(request, response) {
        response.redirect('/');
        return false; // 나머지 뒤의 코드를 실행되지 않게 함(로그인 안돼있으니까)
    }
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
        var title = request.params.pageId;
        var list = template.list(request.list);
        var html = template.HTML(title, list,
        `
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/create">create</a> <a href="/update/${title}">update</a>`, auth.statusUI(request, response)
        );
        response.send(html);
    });
);

router.post("/update_process", (request, response) =>  
     var request.body;
     var id = post.id;
     var title = post.title;
     var description = post.description;
     fs.rename(`data/${id}`, `data/${title}`, function(error){
       fs.writeFile(`data/${title}`, description, 'utf8', function(err){
         response.redirect(`/page/${title}`);
       });
     });
);

router.post("/delete_process", (request, response) =>
    if(!auth.isOwner)(request, response) {
        response.redirect('/');
        return false; // 나머지 뒤의 코드를 실행되지 않게 함(로그인 안돼있으니까)
    }
    var post = request.body;
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(error){
        response.redirect('/');
    });

router.get("/:pageId", (request, response, next) => // 미들웨어 순서에 의해 cru가 먼저 라우트 되어야함(왜냐면 /topic까지는 공통 url인데 예를 들어, /topic/create 로 라우팅 되면 data에 create 파일이 없어 :pageId가 없으므로 오류)
     var filteredId = path.parse(request.params.pageId).base;
     fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
       if(err) {
            next(err); // 아무것도 없거나 'route'가 아닌 경우는 에러를 던지는 것으로 내부적으로 약속
       } else {
            var title = request.params.pageId;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {allowedTags:['h1']});
            var list = template.list(request.list);
            var html = template.HTML(sanitizedTitle, list,
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              `<a href="/create">create</a>
               <a href="/update/${sanitizedTitle}">update</a> // routing params 이용하므로 ?id=${} 제거
               <form action="/delete_process" method="post"> // /delete... 라고 안적으면 눌렀을 때, /page의 하위에서 delete로 이동!
               <input type="hidden" name="id" value="${sanitizedTitle}">
               <input type="submit" value="delete">
           </form>`, auth.statusUI(request, response)
       );
       response.send(html);
     }
  });
);
);
