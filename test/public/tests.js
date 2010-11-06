
var tests = {};

tests['clearRect()'] = function(ctx){
  ctx.fillRect(25,25,100,100);
  ctx.clearRect(45,45,60,60);
  ctx.fillRect(50,50,50,50);
};

tests['strokeRect()'] = function(ctx){
  ctx.fillRect(25,25,100,100);
  ctx.clearRect(45,45,60,60);
  ctx.strokeRect(50,50,50,50);
};

tests['lineTo()'] = function(ctx){
  // Filled triangle
  ctx.beginPath();
  ctx.moveTo(25.5,25);
  ctx.lineTo(105,25);
  ctx.lineTo(25,105);
  ctx.fill();

  // Stroked triangle
  ctx.beginPath();
  ctx.moveTo(125,125);
  ctx.lineTo(125,45);
  ctx.lineTo(45,125);
  ctx.closePath();
  ctx.stroke();
};

tests['arc()'] = function(ctx){
  ctx.beginPath();
  ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
  ctx.moveTo(110,75);
  ctx.arc(75,75,35,0,Math.PI,false);   // Mouth
  ctx.moveTo(65,65);
  ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
  ctx.moveTo(95,65);
  ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
  ctx.stroke();
};

tests['bezierCurveTo()'] = function(ctx){
  ctx.beginPath();
  ctx.moveTo(75,40);
  ctx.bezierCurveTo(75,37,70,25,50,25);
  ctx.bezierCurveTo(20,25,20,62.5,20,62.5);
  ctx.bezierCurveTo(20,80,40,102,75,120);
  ctx.bezierCurveTo(110,102,130,80,130,62.5);
  ctx.bezierCurveTo(130,62.5,130,25,100,25);
  ctx.bezierCurveTo(85,25,75,37,75,40);
  ctx.fill();
};

tests['quadraticCurveTo()'] = function(ctx){
  ctx.beginPath();
  ctx.moveTo(75,25);
  ctx.quadraticCurveTo(25,25,25,62.5);
  ctx.quadraticCurveTo(25,100,50,100);
  ctx.quadraticCurveTo(50,120,30,125);
  ctx.quadraticCurveTo(60,120,65,100);
  ctx.quadraticCurveTo(125,100,125,62.5);
  ctx.quadraticCurveTo(125,25,75,25);
  ctx.stroke();
};

tests['rotate()'] = function(ctx){
  ctx.rotate(0.4);
  ctx.translate(30,0);
  ctx.rect(0,0,50,50);
  ctx.stroke();
};

tests['rect()'] = function(ctx){
  ctx.rect(5,5,50,50);
  ctx.strokeStyle = 'yellow';
  ctx.fill();
  ctx.stroke();
};

tests['clip()'] = function(ctx){
  ctx.arc(50,50,50,0,Math.PI * 2);
  ctx.stroke();
  ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,.5)';
  ctx.fillRect(0,0,100,100);
};

tests['createLinearGradient()'] = function(ctx){
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

tests['createRadialGradient()'] = function(ctx){
  // Create gradients
  var radgrad = ctx.createRadialGradient(45,45,10,52,50,30);
  radgrad.addColorStop(0, '#A7D30C');
  radgrad.addColorStop(0.9, '#019F62');
  radgrad.addColorStop(1, 'rgba(1,159,98,0)');

  var radgrad2 = ctx.createRadialGradient(105,105,20,112,120,50);
  radgrad2.addColorStop(0, '#FF5F98');
  radgrad2.addColorStop(0.75, '#FF0188');
  radgrad2.addColorStop(1, 'rgba(255,1,136,0)');

  var radgrad3 = ctx.createRadialGradient(95,15,15,102,20,40);
  radgrad3.addColorStop(0, '#00C9FF');
  radgrad3.addColorStop(0.8, '#00B5E2');
  radgrad3.addColorStop(1, 'rgba(0,201,255,0)');

  var radgrad4 = ctx.createRadialGradient(0,150,50,0,140,90);
  radgrad4.addColorStop(0, '#F4F201');
  radgrad4.addColorStop(0.8, '#E4C700');
  radgrad4.addColorStop(1, 'rgba(228,199,0,0)');

  // draw shapes
  ctx.fillStyle = radgrad4;
  ctx.fillRect(0,0,150,150);
  ctx.fillStyle = radgrad3;
  ctx.fillRect(0,0,150,150);
  ctx.fillStyle = radgrad2;
  ctx.fillRect(0,0,150,150);
  ctx.fillStyle = radgrad;
  ctx.fillRect(0,0,150,150);
};

tests['globalAlpha'] = function(ctx){
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.strokeRect(0,0,50,50);

  ctx.globalAlpha = 0.8;
  ctx.fillRect(20,20,20,20);

  ctx.fillStyle = 'black';
  ctx.globalAlpha = 1;
  ctx.fillRect(25,25,10,10);
};

tests['fillStyle'] = function(ctx){
  ctx.fillStyle = 'rgb(0,55,0)';
  ctx.fillRect(10, 10, 50, 50);

  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(60, 60, 50, 50);

  ctx.fillStyle = '#000';
  ctx.fillRect(110, 110, 50, 50);
};

tests['fill with stroke'] = function(ctx){
  ctx.beginPath();
  ctx.arc(75,75,50,0,Math.PI*2,true);
  ctx.fill();
  ctx.closePath();
  ctx.beginPath();
  ctx.fillStyle = 'red';
  ctx.strokeStyle = 'yellow';
  ctx.arc(75,75,30,0,Math.PI*2,true);
  ctx.fill();
  ctx.stroke();
};

tests['lineWidth'] = function(ctx){
  ctx.beginPath();
  ctx.lineWidth = 10.0;
  ctx.moveTo(50, 50);
  ctx.lineTo(50, 100);
  ctx.lineTo(80, 120);
  ctx.stroke();
};

tests['lineCap'] = function(ctx){
  ctx.beginPath();
  ctx.lineWidth = 10.0;
  ctx.lineCap = 'round';
  ctx.moveTo(50, 50);
  ctx.lineTo(50, 100);
  ctx.lineTo(80, 120);
  ctx.stroke();
};

tests['lineJoin'] = function(ctx){
  ctx.beginPath();
  ctx.lineWidth = 10.0;
  ctx.lineJoin = 'round';
  ctx.moveTo(50, 50);
  ctx.lineTo(50, 100);
  ctx.lineTo(80, 120);
  ctx.stroke();
};

tests['states'] = function(ctx){
  ctx.save();
  ctx.rect(50, 50, 100, 100);
  ctx.stroke();

  ctx.restore();
  ctx.save();
  ctx.translate(50,50);
  ctx.scale(.5,.5);
  ctx.strokeRect(51, 51, 100, 100);

  ctx.restore();
  ctx.translate(95,95);
  ctx.fillRect(0,0,10,10);
};

tests['states with stroke/fill/globalAlpha'] = function(ctx){
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
};

tests['invalid stroke/fill styles'] = function(ctx){
  ctx.fillStyle = 'red';
  ctx.strokeStyle = 'yellow';
  ctx.rect(50,50,50,50);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = 'asdf';
  ctx.strokeStyle = 'asdf';
  ctx.rect(100,80,15,15);
  ctx.fill();
  ctx.stroke();
};

tests['fillText()'] = function(ctx){
  ctx.font = '30px Arial';
  ctx.rotate(.1);
  ctx.lineTo(10,10);
  ctx.fillText("Awesome!", 50, 100);

  var te = ctx.measureText('Awesome!');

  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineTo(50, 102);
  ctx.lineTo(50 + te.width, 102);
  ctx.stroke();
};

tests['fillText() transformations'] = function(ctx){
  ctx.strokeStyle = '#666';
  ctx.font = 'bold 12px Helvetica';

  ctx.strokeRect(0,0,200,200);
  ctx.lineTo(0,100);
  ctx.lineTo(200,100);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineTo(100,0);
  ctx.lineTo(100,200);
  ctx.stroke();

  ctx.rotate(0.2);
  ctx.fillText("foo", 150, 100);
  ctx.font = 'normal 30px Arial';
  ctx.fillText("bar", 50, 100);
};

tests['strokeText()'] = function(ctx){
  ctx.strokeStyle = '#666';
  ctx.strokeRect(0,0,200,200);
  ctx.lineTo(0,100);
  ctx.lineTo(200,100);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineTo(100,0);
  ctx.lineTo(100,200);
  ctx.stroke();

  ctx.strokeStyle = 'red';
  ctx.font = 'normal 50px Arial';
  ctx.strokeText("bar", 100, 100);
};

tests['textAlign right'] = function(ctx){
  ctx.strokeStyle = '#666';
  ctx.strokeRect(0,0,200,200);
  ctx.lineTo(0,100);
  ctx.lineTo(200,100);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineTo(100,0);
  ctx.lineTo(100,200);
  ctx.stroke();

  ctx.font = 'normal 20px Arial';
  ctx.textAlign = 'right';
  ctx.fillText("right", 100, 100);
};

tests['textAlign left'] = function(ctx){
  ctx.strokeStyle = '#666';
  ctx.strokeRect(0,0,200,200);
  ctx.lineTo(0,100);
  ctx.lineTo(200,100);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineTo(100,0);
  ctx.lineTo(100,200);
  ctx.stroke();

  ctx.font = 'normal 20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText("left", 100, 100);
};

tests['textAlign center'] = function(ctx){
  ctx.strokeStyle = '#666';
  ctx.strokeRect(0,0,200,200);
  ctx.lineTo(0,100);
  ctx.lineTo(200,100);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineTo(100,0);
  ctx.lineTo(100,200);
  ctx.stroke();

  ctx.font = 'normal 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText("center", 100, 100);
};

tests['textBaseline alphabetic'] = function(ctx){
  ctx.strokeStyle = '#666';
  ctx.strokeRect(0,0,200,200);
  ctx.lineTo(0,100);
  ctx.lineTo(200,100);
  ctx.stroke();

  ctx.font = 'normal 20px Arial';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  ctx.fillText("alphabetic", 100, 100);
};

tests['textBaseline top'] = function(ctx){
  ctx.strokeStyle = '#666';
  ctx.strokeRect(0,0,200,200);
  ctx.lineTo(0,100);
  ctx.lineTo(200,100);
  ctx.stroke();

  ctx.font = 'normal 20px Arial';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  ctx.fillText("top", 100, 100);
};

tests['textBaseline hanging'] = function(ctx){
  ctx.strokeStyle = '#666';
  ctx.strokeRect(0,0,200,200);
  ctx.lineTo(0,100);
  ctx.lineTo(200,100);
  ctx.stroke();

  ctx.font = 'normal 20px Arial';
  ctx.textBaseline = 'hanging';
  ctx.textAlign = 'center';
  ctx.fillText("hanging", 100, 100);
};

tests['textBaseline bottom'] = function(ctx){
  ctx.strokeStyle = '#666';
  ctx.strokeRect(0,0,200,200);
  ctx.lineTo(0,100);
  ctx.lineTo(200,100);
  ctx.stroke();

  ctx.font = 'normal 20px Arial';
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'center';
  ctx.fillText("bottom", 100, 100);
};

tests['textBaseline ideographic'] = function(ctx){
  ctx.strokeStyle = '#666';
  ctx.strokeRect(0,0,200,200);
  ctx.lineTo(0,100);
  ctx.lineTo(200,100);
  ctx.stroke();

  ctx.font = 'normal 20px Arial';
  ctx.textBaseline = 'ideographic';
  ctx.textAlign = 'center';
  ctx.fillText("ideographic", 100, 100);
};

tests['integration 1'] = function(ctx){
  ctx.fillStyle = '#eee';
	ctx.fillRect(0,0,300,300);

	ctx.fillStyle = "rgba(0,0,200,0.5)";
	ctx.strokeStyle= "rgba(100,100,100,0.5)";
	var n = Date.now()/1000;
	var xs = 10, ys = 10, cx = xs/2, cy=ys/2, xd = 300/xs, yd = 300/ys;
	for(var xt = 0; xt<300; xt+=xd){
		for(var yt = 0; yt<300; yt+=yd){
		  ctx.moveTo(xt,0);ctx.lineTo(xt,300);
		  ctx.moveTo(0,yt);ctx.lineTo(300,yt);
		}
	}
	ctx.stroke();
	ctx.strokeWidth = 5;
	ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.fillStyle= "rgba(0,174,239,0.8)";
  ctx.beginPath();
  ctx.moveTo(0,300);
  for(var xt = 0; xt<300; xt+=1)
      ctx.lineTo(xt, 100+10*Math.sin(xt/32+n+Math.sin(xt/64+n))*5+Math.sin(xt/48));
  ctx.lineTo(300,300);
  ctx.lineTo(0,300);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = "rgba(242,0,144,0.7)"; n = n+2;
  for(var xt = 0; xt<300; xt+=1)
      ctx.lineTo(xt, 150+10*Math.sin(xt/32+n+Math.sin(xt/64+n))*5+Math.sin(xt/48));
  ctx.lineTo(300,300);
  ctx.lineTo(0,300);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = "rgba(255,254,0,0.7)"; n = n+4;
  for(var xt = 0; xt<300; xt+=1)
      ctx.lineTo(xt, 200+10*Math.sin(xt/32+n+Math.sin(xt/64+n))*5+Math.sin(xt/48));
  ctx.lineTo(300,300);
  ctx.lineTo(0,300);
  ctx.fill();
  ctx.stroke();
};

tests['globalCompositeOperation source-over'] = function(ctx){
  ctx.fillStyle = 'blue';
  ctx.fillRect(0,0,100,100);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'red';
  ctx.arc(80,80,50,0,Math.PI * 2);
  ctx.fill();
};