
window.onload = runTests;

function get(id) {
  return document.getElementById(id);
}

function create(type) {
  return document.createElement(type);
}

function runTests() {
  var table = get('tests');
  for (var name in tests) {
    var fn = tests[name]
      , canvas = create('canvas')
      , tr = create('tr')
      , tds = [create('td'), create('td'), create('td')]
      , src = create('pre');
    src.innerText = fn.toString();
    canvas.width = 200;
    canvas.height = 200;
    canvas.title = name;
    tds[1].appendChild(canvas);
    tds[2].appendChild(src);
    tr.appendChild(tds[0]);
    tr.appendChild(tds[1]);
    tr.appendChild(tds[2]);
    table.appendChild(tr);
    runTest(name, canvas, tds[0]);
  }
}

function runTest(name, canvas, dest) {
  var fn = tests[name];
  fn(canvas.getContext('2d'));
  renderOnServer(name, canvas, function(res){
    if (res.error) {
      var p = create('p');
      p.innerText = res.error;
      dest.appendChild(p);
    } else if (res.data) {
      var img = create('image');
      img.src = res.data;
      img.alt = img.title = name;
      dest.appendChild(img);
    }
  });
}

function renderOnServer(name, canvas, fn) {
  var req = new XMLHttpRequest
    , json = JSON.stringify({
      fn: tests[name].toString()
      , width: canvas.width
      , height: canvas.height
    });
  req.open('POST', '/render');
  req.setRequestHeader('Content-Type', 'application/json');
  req.onreadystatechange = function(){
    if (4 == req.readyState) {
      try {
        fn(JSON.parse(req.responseText));
      } catch (err) {
        fn({ error: err });
      }
    }
  };
  req.send(json);
}