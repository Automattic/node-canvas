
/**
 * Module dependencies.
 */

var express = require('../support/express')
  , Canvas = require('../lib/canvas')
  , Image = Canvas.Image
  , jade = require('../support/jade')
  , app = express.createServer();

// Config

app.register('.jade', jade);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Middleware

app.use(express.favicon());
app.use(express.logger({ format: '\x1b[90m:remote-addr\x1b[0m - \x1b[33m:method\x1b[0m :url :status \x1b[90m:response-timems\x1b[0m' }));
app.use(express.bodyDecoder());
app.use(app.router);
app.use(express.staticProvider(__dirname + '/public'));
app.use(express.errorHandler({ showStack: true }));

// Routes

app.get('/', function(req, res){
  res.render('tests');
});

app.post('/render', function(req, res, next){
  // Normalize state.png as ./public/state.png
  // no good way around this at the moment
  req.body.fn = req.body.fn
    .replace("'state.png'", "'" + __dirname + "/public/state.png'")
    .replace("'face.jpeg'", "'" + __dirname + "/public/face.jpeg'");
  
  // Do not try this at home :)
  var fn = eval('(' + req.body.fn + ')')
    , width = req.body.width
    , height = req.body.height
    , canvas = new Canvas(width, height)
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

app.listen(parseInt(process.argv[2] || '3000', 10));
console.log('Test server listening on port %d', app.address().port);