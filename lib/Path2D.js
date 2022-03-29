const CanvasRenderingContext2D = require("./context2d");

const ARG_LENGTH = {
  a: 7,
  c: 6,
  h: 1,
  l: 2,
  m: 2,
  q: 4,
  s: 4,
  t: 2,
  v: 1,
  z: 0,
};
const SEGMENT_PATTERN = /([astvzqmhlc])([^astvzqmhlc]*)/gi;
const NUMBER = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;

function parseValues(args) {
  const numbers = args.match(NUMBER);
  return numbers ? numbers.map(Number) : [];
}
/**
 * parse an svg path data string. Generates an Array
 * of commands where each command is an Array of the
 * form `[command, arg1, arg2, ...]`
 *
 * https://www.w3.org/TR/SVG/paths.html#PathDataGeneralInformation
 * @ignore
 *
 * @param {string} path
 * @returns {array}
 */

function parse(path) {
  const data = [];
  const p = String(path).trim(); // A path data segment (if there is one) must begin with a "moveto" command

  if (p[0] !== "M" && p[0] !== "m") {
    return data;
  }

  p.replace(SEGMENT_PATTERN, (_, command, args) => {
    let type = command.toLowerCase();
    const theArgs = parseValues(args);
    let theCommand = command; // overloaded moveTo

    if (type === "m" && theArgs.length > 2) {
      data.push([theCommand].concat(theArgs.splice(0, 2)));
      type = "l";
      theCommand = theCommand === "m" ? "l" : "L";
    } // Ignore invalid commands

    if (theArgs.length < ARG_LENGTH[type]) {
      return "";
    }

    data.push([theCommand].concat(theArgs.splice(0, ARG_LENGTH[type]))); // The command letter can be eliminated on subsequent commands if the
    // same command is used multiple times in a row (e.g., you can drop the
    // second "L" in "M 100 200 L 200 100 L -100 -200" and use
    // "M 100 200 L 200 100 -100 -200" instead).

    while (
      theArgs.length >= ARG_LENGTH[type] &&
      theArgs.length &&
      ARG_LENGTH[type]
    ) {
      data.push([theCommand].concat(theArgs.splice(0, ARG_LENGTH[type])));
    }

    return "";
  });
  return data;
}

function rotatePoint(point, angle) {
  const nx = point.x * Math.cos(angle) - point.y * Math.sin(angle);
  const ny = point.y * Math.cos(angle) + point.x * Math.sin(angle);
  point.x = nx;
  point.y = ny;
}

function translatePoint(point, dx, dy) {
  point.x += dx;
  point.y += dy;
}

function scalePoint(point, s) {
  point.x *= s;
  point.y *= s;
}

class Path2D {
  segments = [];
  constructor(path) {
    this.addPath(path);
  }
  addPath(path) {
    if (path && path instanceof Path2D) {
    } else if (path) {
      this.segments = parse(path);
    }
  }
  moveTo(x, y) {
    this.segments.push(["M", x, y]);
  }
  lineTo(x, y) {
    this.segments.push(["L", x, y]);
  }
  arc(x, y, r, start, end, ccw) {
    this.segments.push(["AC", x, y, r, start, end, !!ccw]);
  }
  arcTo(x1, y1, x2, y2, r) {
    this.segments.push(["AT", x1, y1, x2, y2, r]);
  }
  ellipse(x, y, rx, ry, angle, start, end, ccw) {
    this.segments.push(["E", x, y, rx, ry, angle, start, end, !!ccw]);
  }
  closePath() {
    this.segments.push(["Z"]);
  }
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.segments.push(["C", cp1x, cp1y, cp2x, cp2y, x, y]);
  }
  quadraticCurveTo(cpx, cpy, x, y) {
    this.segments.push(["Q", cpx, cpy, x, y]);
  }
  rect(x, y, width, height) {
    this.segments.push(["R", x, y, width, height]);
  }
}

function buildPath(canvas, segments) {
  let endAngle;
  let startAngle;
  let largeArcFlag;
  let sweepFlag;
  let endPoint;
  let midPoint;
  let angle;
  let lambda;
  let t1;
  let t2;
  let x;
  let x1;
  let y;
  let y1;
  let r;
  let rx;
  let ry;
  let w;
  let h;
  let pathType;
  let centerPoint;
  let cpx;
  let cpy;
  let qcpx;
  let qcpy;
  let ccw;
  let startPoint = {
    x: 0,
    y: 0,
  };
  const currentPoint = {
    x: 0,
    y: 0,
  };
  canvas.beginPath();

  for (let i = 0; i < segments.length; ++i) {
    const s = segments[i];
    pathType = s[0]; // Reset control point if command is not cubic

    if (
      pathType !== "S" &&
      pathType !== "s" &&
      pathType !== "C" &&
      pathType !== "c"
    ) {
      cpx = null;
      cpy = null;
    }

    if (
      pathType !== "T" &&
      pathType !== "t" &&
      pathType !== "Q" &&
      pathType !== "q"
    ) {
      qcpx = null;
      qcpy = null;
    }

    switch (pathType) {
      case "m":
      case "M":
        if (pathType === "m") {
          x += s[1];
          y += s[2];
        } else {
          x = s[1];
          y = s[2];
        }

        if (pathType === "M" || !startPoint) {
          startPoint = {
            x,
            y,
          };
        }

        canvas.moveTo(x, y);
        break;

      case "l":
        x += s[1];
        y += s[2];
        canvas.lineTo(x, y);
        break;

      case "L":
        x = s[1];
        y = s[2];
        canvas.lineTo(x, y);
        break;

      case "H":
        x = s[1];
        canvas.lineTo(x, y);
        break;

      case "h":
        x += s[1];
        canvas.lineTo(x, y);
        break;

      case "V":
        y = s[1];
        canvas.lineTo(x, y);
        break;

      case "v":
        y += s[1];
        canvas.lineTo(x, y);
        break;

      case "a":
      case "A":
        if (pathType === "a") {
          x += s[6];
          y += s[7];
        } else {
          x = s[6];
          y = s[7];
        }

        rx = s[1]; // rx

        ry = s[2]; // ry

        angle = (s[3] * Math.PI) / 180;
        largeArcFlag = !!s[4];
        sweepFlag = !!s[5];
        endPoint = {
          x,
          y,
        }; // https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes

        midPoint = {
          x: (currentPoint.x - endPoint.x) / 2,
          y: (currentPoint.y - endPoint.y) / 2,
        };
        rotatePoint(midPoint, -angle); // radius correction

        lambda =
          (midPoint.x * midPoint.x) / (rx * rx) +
          (midPoint.y * midPoint.y) / (ry * ry);

        if (lambda > 1) {
          lambda = Math.sqrt(lambda);
          rx *= lambda;
          ry *= lambda;
        }

        centerPoint = {
          x: (rx * midPoint.y) / ry,
          y: -(ry * midPoint.x) / rx,
        };
        t1 = rx * rx * ry * ry;
        t2 =
          rx * rx * midPoint.y * midPoint.y + ry * ry * midPoint.x * midPoint.x;

        if (sweepFlag !== largeArcFlag) {
          scalePoint(centerPoint, Math.sqrt((t1 - t2) / t2) || 0);
        } else {
          scalePoint(centerPoint, -Math.sqrt((t1 - t2) / t2) || 0);
        }

        startAngle = Math.atan2(
          (midPoint.y - centerPoint.y) / ry,
          (midPoint.x - centerPoint.x) / rx
        );
        endAngle = Math.atan2(
          -(midPoint.y + centerPoint.y) / ry,
          -(midPoint.x + centerPoint.x) / rx
        );
        rotatePoint(centerPoint, angle);
        translatePoint(
          centerPoint,
          (endPoint.x + currentPoint.x) / 2,
          (endPoint.y + currentPoint.y) / 2
        );
        canvas.save();
        canvas.translate(centerPoint.x, centerPoint.y);
        canvas.rotate(angle);
        canvas.scale(rx, ry);
        canvas.arc(0, 0, 1, startAngle, endAngle, !sweepFlag);
        canvas.restore();
        break;

      case "C":
        cpx = s[3]; // Last control point

        cpy = s[4];
        x = s[5];
        y = s[6];
        canvas.bezierCurveTo(s[1], s[2], cpx, cpy, x, y);
        break;

      case "c":
        canvas.bezierCurveTo(
          s[1] + x,
          s[2] + y,
          s[3] + x,
          s[4] + y,
          s[5] + x,
          s[6] + y
        );
        cpx = s[3] + x; // Last control point

        cpy = s[4] + y;
        x += s[5];
        y += s[6];
        break;

      case "S":
        if (cpx === null || cpy === null) {
          cpx = x;
          cpy = y;
        }

        canvas.bezierCurveTo(2 * x - cpx, 2 * y - cpy, s[1], s[2], s[3], s[4]);
        cpx = s[1]; // last control point

        cpy = s[2];
        x = s[3];
        y = s[4];
        break;

      case "s":
        if (cpx === null || cpy === null) {
          cpx = x;
          cpy = y;
        }

        canvas.bezierCurveTo(
          2 * x - cpx,
          2 * y - cpy,
          s[1] + x,
          s[2] + y,
          s[3] + x,
          s[4] + y
        );
        cpx = s[1] + x; // last control point

        cpy = s[2] + y;
        x += s[3];
        y += s[4];
        break;

      case "Q":
        qcpx = s[1]; // last control point

        qcpy = s[2];
        x = s[3];
        y = s[4];
        canvas.quadraticCurveTo(qcpx, qcpy, x, y);
        break;

      case "q":
        qcpx = s[1] + x; // last control point

        qcpy = s[2] + y;
        x += s[3];
        y += s[4];
        canvas.quadraticCurveTo(qcpx, qcpy, x, y);
        break;

      case "T":
        if (qcpx === null || qcpy === null) {
          qcpx = x;
          qcpy = y;
        }

        qcpx = 2 * x - qcpx; // last control point

        qcpy = 2 * y - qcpy;
        x = s[1];
        y = s[2];
        canvas.quadraticCurveTo(qcpx, qcpy, x, y);
        break;

      case "t":
        if (qcpx === null || qcpy === null) {
          qcpx = x;
          qcpy = y;
        }

        qcpx = 2 * x - qcpx; // last control point

        qcpy = 2 * y - qcpy;
        x += s[1];
        y += s[2];
        canvas.quadraticCurveTo(qcpx, qcpy, x, y);
        break;

      case "z":
      case "Z":
        x = startPoint.x;
        y = startPoint.y;
        startPoint = undefined;
        canvas.closePath();
        break;

      case "AC":
        // arc
        x = s[1];
        y = s[2];
        r = s[3];
        startAngle = s[4];
        endAngle = s[5];
        ccw = s[6];
        canvas.arc(x, y, r, startAngle, endAngle, ccw);
        break;

      case "AT":
        // arcTo
        x1 = s[1];
        y1 = s[2];
        x = s[3];
        y = s[4];
        r = s[5];
        canvas.arcTo(x1, y1, x, y, r);
        break;

      case "E":
        // ellipse
        x = s[1];
        y = s[2];
        rx = s[3];
        ry = s[4];
        angle = s[5];
        startAngle = s[6];
        endAngle = s[7];
        ccw = s[8];
        canvas.save();
        canvas.translate(x, y);
        canvas.rotate(angle);
        canvas.scale(rx, ry);
        canvas.arc(0, 0, 1, startAngle, endAngle, ccw);
        canvas.restore();
        break;

      case "R":
        // rect
        x = s[1];
        y = s[2];
        w = s[3];
        h = s[4];
        startPoint = {
          x,
          y,
        };
        canvas.rect(x, y, w, h);
        break;
    }

    currentPoint.x = x;
    currentPoint.y = y;
  }
}

const cFill = CanvasRenderingContext2D.prototype.fill;
const cStroke = CanvasRenderingContext2D.prototype.stroke;

CanvasRenderingContext2D.prototype.fill = function fill() {
  let fillRule = "nonzero";

  if (args.length === 0 || (args.length === 1 && typeof args[0] === "string")) {
    cFill.apply(this, args);
    return;
  }

  if (arguments.length === 2) {
    fillRule = args[1];
  }

  const path = args[0];
  buildPath(this, path.segments);
  cFill.call(this, fillRule);
};

CanvasRenderingContext2D.prototype.stroke = function stroke(path) {
  if (!path) {
    cStroke.call(this);
    return;
  }

  buildPath(this, path.segments);
  cStroke.call(this);
};

const cIsPointInPath = CanvasRenderingContext2D.prototype.isPointInPath;

CanvasRenderingContext2D.prototype.isPointInPath = function isPointInPath() {
  for (
    var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
    _key2 < _len2;
    _key2++
  ) {
    args[_key2] = arguments[_key2];
  }

  // let fillRule = 'nonzero';
  if (args[0].constructor.name === "Path2D") {
    // first argument is a Path2D object
    const x = args[1];
    const y = args[2];
    const fillRule = args[3] || "nonzero";
    const path = args[0];
    buildPath(this, path.segments);
    return cIsPointInPath.apply(this, [x, y, fillRule]);
  } else {
    return cIsPointInPath.apply(this, args);
  }
};

module.exports = Path2D;
