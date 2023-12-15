const fs = require("fs");
const path = require("path");
const canvas = require("..");

const root = path.join(__dirname, "..");
const file = path.join(root, "index.js");
const file2 = path.join(root, "index.d.ts");

let data = fs.readFileSync(file, "utf-8");
let data2 = fs.readFileSync(file2, "utf-8");

if (!canvas.hasOwnProperty("DOMMatrix")) {
    data += "\nmodule.exports.DOMMatrix = DomMatrix;";
    data2 += "\nexport type DOMMatrix = DomMatrix;";
    
    fs.writeFileSync(file, data);
    fs.writeFileSync(file2, data2);
}

if (!data2.includes("export type DOMPoint")) {
    data2 += "\nexport type DOMPoint = DomPoint;";
    
    fs.writeFileSync(file, data);
    fs.writeFileSync(file2, data2);
}
