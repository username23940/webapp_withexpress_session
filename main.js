const express = require("express") // express 에는 다른 것이 들어올 일이 없으니까, 저 이름의 값이 바뀌지 않도록 고정(const로)
const app = express() // express를 호출. app 객체를 담음. 
var fs = require('fs');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
// modules

app.get("/", (request, response) => 
     fs.readdir('./data', function(error, filelist){
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(filelist);
        var html = template.HTML(title, list,
        `<h2>${title}</h2>${description}`,
        `<a href="/create">create</a>`
        );
        response.send(html);
     });
); 

app.get("/page/:pageId", (request, response) =>
     fs.readdir('./data', function(error, filelist){
          var filteredId = path.parse(request.params.pageId).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = request.params.pageId;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
              allowedTags:['h1']
            });
            var list = template.list(filelist);
            var html = template.HTML(sanitizedTitle, list,
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              ` <a href="/create">create</a>
                <a href="/update/${sanitizedTitle}">update</a> // ?id=${}에서 routing params 이용하므로 제거
                <form action="/delete_process" method="post"> // /delete.. 라고 안적으면 눌렀을 때, /page의 하위에서 delete로 이동!
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.send(html);
          });
     });
);

app.get("/create", (request, response) => 
    fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = template.list(filelist);
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
        `, '');
        response.send(html);
    });
);

app.post("/create_process", (request, response) =>  // form 에서 post 방식으로 전송했기 때문 
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
            response.redirect(`/page/${title}`);

          })
      });    
);

app.get("/update/:pageId", (request, response) =>
    fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(request.params.pageId).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = request.params.pageId;
            var list = template.list(filelist);
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
            `<a href="/create">create</a> <a href="/update/${title}">update</a>`
            );
            response.send(html);
        });
      });
);

app.post("/update_process", (request, response) =>  
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var title = post.title;
          var description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(error){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.redirect(`/page/${title}`);
            })
          });
      });  
);

app.post("/delete_process", (request, response) =>
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          fs.unlink(`data/${filteredId}`, function(error){
            response.redirect('/');
          });
      });
);

app.listen(3000, () => console.log("Example App listening on port 3000!"))
// 웹서버가 실행되면서 3000번 포트 리스닝, 성공시 console 출력


/*
app.get("/", (req,res) => res.send("Hello World"))
app 객체에서 get 메서드 사용.
app.get("/", function(req,res) { return res.send("Hello World");} 이거랑 같아
get 메서드 : 라우트, 라우팅. 사용자들이 여러가지 path로 들어올 때, path마다 적당한 응답을 해줌
첫번째 인자는 경로, 두번쨰 인자는 그 경로로 접속했을 때 실행할 함수 = 라우팅
기존 코드에서는 if 문을 통해 구현

app.get("/page/:pageId", (request, response) => // /page 뒤에 들어올 어떤 값에 :pageId라는 이름을 붙였고, params 객체 안에 존재
       return response.send(request.params); 
);

*/

/*
var app = http.createServer(function(request,response){
    

    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
*/
