
var tests = {};

tests['linear gradients'] = function(ctx){
  var lingrad = ctx.createLinearGradient(0,0,0,150);
  lingrad.addColorStop(0, '#00ABEB');
  lingrad.addColorStop(0.5, '#fff');
  lingrad.addColorStop(0.5, '#26C000');
  lingrad.addColorStop(1, '#fff');

  var lingrad2 = ctx.createLinearGradient(0,50,0,95);
  lingrad2.addColorStop(0.5, '#000');
  lingrad2.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = lingrad;
  ctx.strokeStyle = lingrad2;

  ctx.fillRect(10,10,130,130);
  ctx.strokeRect(50,50,50,50);  
};

tests['global alpha'] = function(ctx){
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.strokeRect(0,0,50,50);

  ctx.globalAlpha = 0.8;
  ctx.fillRect(20,20,20,20);

  ctx.fillStyle = 'black';
  ctx.globalAlpha = 1;
  ctx.fillRect(25,25,10,10);
};