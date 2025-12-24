var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');

router.get('/', function(request, response) { 
    
   var title = 'Welcome';
   var description = 'Hello, Node.js';
   var list = template.list(request.list); // main.js에 있는 프로퍼티 접근
   var html = template.HTML(title, list,
     `
     <h2>${title}</h2>${description}
     <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
     `,
     `<a href="/topic/create">create</a>`, auth.statusUI(request, response)
   ); 
   response.send(html);
 });
   
  module.exports = router;
