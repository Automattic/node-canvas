
/**
 * Module dependencies.
 */

var express = require('express')
  , Canvas = require('../lib/canvas')
  , Image = Canvas.Image
  , app = express();

// Config

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Middleware

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler());

// Routes

app.get('/', function(req, res){
  res.render('tests');
});

function testFn(req){
  // Normalize state.png as ./public/state.png
  // no good way around this at the moment
  req.body.fn = req.body.fn
    .replace("'state.png'", "'" + __dirname + "/public/state.png'")
    .replace("'face.jpeg'", "'" + __dirname + "/public/face.jpeg'")
    .replace("'star.png'", "'" + __dirname + "/public/star.png'");

  // Do not try this at home :)
  return eval('(' + req.body.fn + ')');
}

function createCanvas(req, type){
  var width = req.body.width
    , height = req.body.height;
  return new Canvas(width, height, type);
}

app.post('/render', function(req, res, next){
  var fn = testFn(req)
    , canvas = createCanvas(req)
    , ctx = canvas.getContext('2d')
    , start = new Date;

  function done(){
    var duration = new Date - start;
    canvas.toDataURL(function(err, str){
      res.send({ data: str, duration: duration });
    });
  }

  2 == fn.length
    ? fn(ctx, done)
    : fn(ctx), done();
});

app.post('/pdf', function(req, res, next){
  req.body = JSON.parse(req.body.json);
  var fn = testFn(req)
    , canvas = createCanvas(req, 'pdf')
    , ctx = canvas.getContext('2d');

  function done(){
    res.writeHead(200, {'Content-Type' : 'application/pdf'});
    res.write(canvas.toBuffer());
    res.end();
  }

  2 == fn.length
    ? fn(ctx, done)
    : fn(ctx), done();
});


var port = parseInt(process.argv[2] || '4000', 10);
app.listen(port);
console.log('Test server listening on port %d', port);
