
function log() {
  if (window.console) console.log.apply(this, arguments);
}

window.onload = function(){
  runTests();
  get('run').addEventListener('click', runTests, false);
};

document.addEventListener('keypress', function(event){
  if (114 == event.charCode) runTests();
}, false);

function get(id) {
  return document.getElementById(id);
}

function create(type, str) {
  var el = document.createElement(type);
  if (str) el.appendChild(text(str));
  return el;
}

function text(str) {
  return document.createTextNode(str);
}

function clearTests() {
  var table = get('tests');
  table.removeChild(table.children[1]);
}

function runTests() {
  clearTests();
  var table = get('tests')
    , tbody = create('tbody');
  for (var name in tests) {
    var fn = tests[name]
      , canvas = create('canvas')
      , tr = create('tr')
      , tds = [create('td'), create('td'), create('td')];

    canvas.width = 200;
    canvas.height = 200;
    canvas.title = name;

    tds[1].appendChild(canvas);
    tds[2].appendChild(create('h3', name));

    tr.appendChild(tds[0]);
    tr.appendChild(tds[1]);
    tr.appendChild(tds[2]);

    tbody.appendChild(tr);
    table.appendChild(tbody);
    runTest(name, canvas, tds[0], tds[2]);
  }
}

function runTest(name, canvas, dest, stats) {
  var fn = tests[name]
    , start = new Date;
  try {
    fn(canvas.getContext('2d'), function(){});
  } catch (err) {
    log(err);
  }
  var duration = new Date - start;
  stats.appendChild(create('p', 'browser: ' + duration + 'ms'));
  stats.appendChild(create('p', 'fps: ' + (1000 / duration).toFixed(0)));
  renderOnServer(name, canvas, function(res){
    if (res.error) {
      var p = create('p');
      p.innerText = res.error;
      dest.appendChild(p);
    } else if (res.data) {
      var img = create('img');
      img.src = res.data;
      stats.appendChild(create('p', 'node: ' + res.duration + 'ms'));
      stats.appendChild(create('p', 'fps: ' + (1000 / res.duration).toFixed(0)));
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