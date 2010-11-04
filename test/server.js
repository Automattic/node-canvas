
/**
 * Module dependencies.
 */

var http = require('http')
  , fs = require('fs');

var args = process.argv.slice(2)
  , port = args.length
    ? parseInt(args[0], 10)
    : 3000;

var images = fs.readdirSync(__dirname + '/images').slice(1).sort();

function ul(items) {
  var buf = '<ul>';
  for (var i = 0, len = items.length; i < len; ++i) {
    var item = items[i];
    buf += '<li>'
        + '<a href="/' + item + '">' + item + '</a><br />'
        + '<img src="/' + item + '" style="border: 1 px solid #eee"/>';
        + '</li>';
  }
  return buf + '</ul>';
}

http.createServer(function(req, res){
  switch (req.url) {
    case '/':
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(ul(images));
      break;
    default:
      fs.readFile(__dirname + '/images' + req.url, function(err, buf){
        if (err || !buf) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<p>Not Found</p>');
        } else {
          res.writeHead(200, {
              'Content-Type': 'image/png'
            , 'Content-Length': buf.length
          });
          res.end(buf);
        }
      });
  }
}).listen(port);
console.log('Test image server started on port ' + port);