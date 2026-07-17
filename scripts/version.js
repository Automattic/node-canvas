const fs = require('fs');
const path = require('path');
const rVersion = /^(\d+)\.(\d+).(\d+)(-([\.A-z0-9]+))?$/
let __pjson;

function getPackageJson() {
  if (__pjson) return __pjson;
  const buffer = fs.readFileSync(path.join(__dirname, "../package.json"));
  __pjson = JSON.parse(buffer);
  return __pjson;
}

function getVersionOrExit() {
  const pjson = getPackageJson();
  let version = process.argv[2];
  let match;
  let parts;

  if (version === 'major') {
    parts = rVersion.exec(pjson.version).slice(1);
    parts[0]++;
  } else if (version === 'minor') {
    parts = rVersion.exec(pjson.version).slice(1);
    parts[1]++;
  } else if (version === 'patch') {
    parts = rVersion.exec(pjson.version).slice(1);
    parts[2]++;
  } else if ((match = rVersion.exec(version))) {
    parts = match.slice(1);
  }

  if (parts) {
    return `${parts[0]}.${parts[1]}.${parts[2]}` + (parts[3] ? parts[3] : '');
  } else {
    console.error('Usage: node scripts/version.js [major|minor|patch|<semver>]');
    process.exit(1);
  }
}

const version = getVersionOrExit();
const pjson = getPackageJson();
const wjsons = {};

pjson.version = version;

for (const dep in pjson.optionalDependencies) {
  const folder = dep.slice(7); // "canvas-"
  try {
    const buffer = fs.readFileSync(path.join(__dirname, `../npm/${folder}/package.json`));
    wjsons[dep] = JSON.parse(buffer);
  } catch (e) {
    console.error(`${dep} is in optionalDependencies, but npm/${folder}/package.json is not a JSON file`);
    process.exit(1);
  }

  pjson.optionalDependencies[dep] = version;
  wjsons[dep].version = version;
}

fs.writeFileSync(path.join(__dirname, "../package.json"), JSON.stringify(pjson, undefined, 2) + '\n');
console.log(`canvas: ${version}`);

for (const dep in wjsons) {
  const folder = dep.slice(7); // "canvas-"
  const wjson = wjsons[dep];
  fs.writeFileSync(path.join(__dirname, `../npm/${folder}/package.json`), JSON.stringify(wjson, undefined, 2) + '\n');
  console.log(`${dep}: ${version}`);
}
