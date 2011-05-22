
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(200, 200)
  , ctx = canvas.getContext('2d')
  , fs = require('fs');

ctx.fillRect(0,0,150,150);  
ctx.save();                 
                            
ctx.fillStyle = '#09F'      
ctx.fillRect(15,15,120,120);
                            
ctx.save();                 
ctx.fillStyle = '#FFF'      
ctx.globalAlpha = 0.5;      
ctx.fillRect(30,30,90,90);  
                            
ctx.restore();              
ctx.fillRect(45,45,60,60);  
                            
ctx.restore();              
ctx.fillRect(60,60,30,30);  

var img = new Image;
img.src = canvas.toBuffer();
ctx.drawImage(img, 0, 0, 50, 50);
ctx.drawImage(img, 50, 0, 50, 50);
ctx.drawImage(img, 100, 0, 50, 50);

var squid = fs.readFileSync(__dirname + '/images/squid.png');
img = new Image;
img.src = squid;
ctx.drawImage(img, 30, 50, img.width / 4, img.height / 4);

var out = fs.createWriteStream(__dirname + '/image-src.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});