var Canvas = require('..')
  , canvas = new Canvas(320, 320)
  , ctx = canvas.getContext('2d');

console.log(Canvas);
console.log(Canvas.Backends);

var imagebackend = new Canvas.Backends.ImageBackend(800, 600);
var fbdevbackend = new Canvas.Backends.FBDevBackend("/dev/fb1");
