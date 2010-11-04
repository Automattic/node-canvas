
/**
 * Module dependencies.
 */

var http = require('http')
  , fs = require('fs');

var args = process.argv.slice(2)
  , port = args.length
    ? parseInt(args[0], 10)
    : 3000;

var images = fs.readdirSync(__dirname + '/images').sort();

function list(images) {
  return '<table><tr><td></td><td>Test</td><td>Reference</td></tr>' + images.map(function(path, i){
    if ('.gitignore' == path) return '';
    return '<tr>'
      + '<td>' + i + '</td>'
      + '<td><img src="/images/' + path + '" style="border: 1px solid #eee; margin-right: 5px"/></td>' 
      + '<td><img src="/references/' + path + '" style="border: 1px solid #eee"/></td>' 
      + '</tr>';
  }).join('') + '</table>';
}

http.createServer(function(req, res){
  switch (req.url) {
    case '/':
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(list(images));
      break;
    default:
      fs.readFile(__dirname + '/' + req.url, function(err, buf){
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