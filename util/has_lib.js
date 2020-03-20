var execSync = require('child_process').execSync
var fs = require('fs')

var SYSTEM_PATHS = [
  '/lib',
  '/usr/lib',
  '/usr/lib64',
  '/usr/local/lib',
  '/opt/local/lib',
  '/usr/lib/x86_64-linux-gnu',
  '/usr/lib/i386-linux-gnu',
  '/usr/lib/arm-linux-gnueabihf',
  '/usr/lib/arm-linux-gnueabi',
  '/usr/lib/aarch64-linux-gnu'
]

function _hasQuery (query) {
  try {
    // execSync throws on nonzero exit
    execSync(query)
    return true
  } catch (err) {
    return false
  }
}

/**
 * Checks for lib using ldconfig if present, or searching SYSTEM_PATHS
 * otherwise.
 * @param {string} lib - library name, e.g. 'jpeg' in 'libjpeg64.so' (see first line)
 * @return {boolean} exists
 */
function hasSystemLib (lib) {
  var libName = 'lib' + lib + '.+(so|dylib)'

  // Try using ldconfig on linux systems
  if (_hasQuery('ldconfig -p 2>/dev/null | grep -E "' + libName + '"')) {
    return true
  }

  // Try checking common library locations
  var libNameRegex = new RegExp(libName)

  return SYSTEM_PATHS.some(function (systemPath) {
    try {
      var dirListing = fs.readdirSync(systemPath)
      return dirListing.some(function (file) {
        return libNameRegex.test(file)
      })
    } catch (err) {
      return false
    }
  })
}

/**
 * Checks for freetype2 with --cflags-only-I
 * @return Boolean exists
 */
function hasFreetype () {
  return _hasQuery('pkg-config cairo --cflags-only-I 2>/dev/null | ' +
                   'grep freetype2')
}

/**
 * Checks for lib using pkg-config.
 * @param {string} lib - library name
 * @return {boolean} exists
 */
function hasPkgconfigLib (lib) {
  return _hasQuery('pkg-config --exists "' + lib + '" 2>/dev/null')
}

function main (query) {
  if (!query) {
    for (var libname of ['gif', 'jpeg', 'cairo', 'pango', 'freetype', 'rsvg']) {
      if (!main(libname)) return false
    }

    return true
  }

  switch (query) {
    case 'cairo':
    case 'gif':
    case 'jpeg':
    case 'X11':
      return hasSystemLib(query)
    case 'pango':
      return hasPkgconfigLib(query)
    case 'freetype':
      return hasFreetype()
    case 'rsvg':
      return hasPkgconfigLib('librsvg-2.0')
    default:
      throw new Error('Unknown library: ' + query)
  }
}

process.stdout.write(main(process.argv[2]).toString())
