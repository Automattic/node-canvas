const { resolve } = require("path");
const { createCanvas, registerFont } = require("../");

function create({ width, height } = { width: 800, height: 600 }) {
  let canvas, context;
  canvas = createCanvas(width, height);
  context = canvas.getContext("2d");

  return {
    canvas,
    context,
  };
}

exports.getCanvasSize = ({ width, height }) => {
  const { canvas, context } = create({
    width,
    height,
  });

  return {
    width: canvas.width,
    height: canvas.height,
  };
};

exports.updateContext = (options) => {
  const { canvas, context } = create();

  for (const key in options) {
    context[key] = options[key];
  }

  return Object.keys(options).reduce(
    (acm, cur) => ({
      ...acm,
      [cur]: context[cur],
    }),
    {}
  );
};

exports.registerFont = (options) => {
  registerFont(options.path, {
    family: options.fontFamily,
  });
};
