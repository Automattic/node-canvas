const fs = require("fs");
const path = require("path");
const canvas = require("..");

const root = path.join(__dirname, "..");
const file = path.join(root, "index.js");

let data = fs.readFileSync(file, "utf-8");

if (!canvas.hasOwnProperty("DOMMatrix")) {
    data += "\nmodule.exports.DOMMatrix = DomMatrix;";
    fs.writeFileSync(file, data);
}
