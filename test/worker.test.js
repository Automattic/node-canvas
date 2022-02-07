const assert = require("assert");
const { resolve } = require("path");
const Piscina = require("piscina");

const filename = resolve(__dirname, "./worker.js");

describe("worker:Canvas", () => {
  it("create success", async () => {
    const pool = new Piscina({
      filename,
    });

    const first = await pool.run(
      { width: 800, height: 600 },
      { name: "getCanvasSize" }
    );

    const second = await pool.run(
      { width: 900, height: 500 },
      { name: "getCanvasSize" }
    );

    assert(
      first.width == 800 && first.height == 600,
      "invalid first canvas size"
    );
    assert(
      second.width == 900 && second.height == 500,
      "invalid second canvas size"
    );
  });

  it("context are independent", async () => {
    const pool = new Piscina({
      filename,
    });
    const ctx1 = {
      font: "20px Helvetica",
      fill: "red",
    };
    const ctx2 = {
      fill: "green",
    };
    const ctxResult1 = await pool.run(ctx1, {
      name: "updateContext",
    });
    const ctxResult2 = await pool.run(ctx2, { name: "updateContext" });

    assert(ctxResult1.font === ctx1.font, "ctx1 font didn't match");
    assert(ctxResult1.fill === ctx1.fill, "ctx1 fill did't match");
    assert(ctxResult2.fill === ctx2.fill, "ctx2 fill did't match");
  });

  it("register font", async () => {
    const pool = new Piscina({
      filename,
    });
    pool.run(
      {
        path: resolve(__dirname, "../examples/pfennigFont/Pfennig.ttf"),
        fontFamily: "pfenning",
      },
      { name: "registerFont" }
    );
    pool.run(
      {
        path: resolve(__dirname, "../examples/pfennigFont/PfennigItalic.sfd"),
        fontFamily: "pfenning_italic",
      },
      { name: "registerFont" }
    );
  });
});
