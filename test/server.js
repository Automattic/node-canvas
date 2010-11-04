
/**
 * Module dependencies.
 */

var express = require('../support/express')
  , jade = require('../support/jade')
  , app = express.createServer();

// Config

app.register('.jade', jade);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Middleware

app.use(express.favicon());
app.use(express.logger({ format: '\x1b[90m:remote-addr\x1b[0m - \x1b[33m:method\x1b[0m :url :status \x1b[90m:response-timems\x1b[0m' }));
app.use(app.router);
app.use(express.errorHandler({ showStack: true }));

// Routes

app.get('/', function(req, res){
  res.render('tests');
});

app.listen(3000);
console.log('Test server listening on port %d', app.address().port);