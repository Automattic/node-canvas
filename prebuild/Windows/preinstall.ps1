$Dependencies = "cairo-2", "png16-16", "jpeg-8", "pango-1.0-0", "pangocairo-1.0-0", "gobject-2.0-0", "glib-2.0-0", "turbojpeg", "gif-7", "freetype-6", "rsvg-2-2", "gsf-1-114"
$UCRTDependencies = "binutils", "tools", "libjpeg-turbo", "pango", "cairo", "giflib", "freetype", "fontconfig", "librsvg", "libxml2", "libgsf", "tools-git"
$UCRTPrefix = "ucrt64/mingw-w64-ucrt-x86_64"
$Tools = "wget", "unzip"

$MSYS2Cmd = (Get-Command msys2).Source
$MSYS2Dir = Split-Path $MSYS2Cmd -Parent
$BashCmd = "$MSYS2Dir\usr\bin\bash.exe"
$GendefCmd = "/ucrt64/bin/gendef.exe"
$DLLToolCmd = "/ucrt64/bin/dlltool.exe"

function ExecBash() {
    Invoke-Expression "$BashCmd -lc '$args'"
}

ExecBash "pacman -Syu --noconfirm"

Foreach($Tool in $Tools) {
    ExecBash "pacman --noconfirm -S $Tool"
}

Foreach($Dependency in $UCRTDependencies) {
    ExecBash "pacman --noconfirm -S $UCRTPrefix-$Dependency"
}

Foreach($Dependency in $Dependencies) {
  ExecBash "$GendefCmd /ucrt64/bin/lib$Dependency.dll"
  ExecBash "$DLLToolCmd -d lib$Dependency.def -l /ucrt64/lib/lib$Dependency.lib"

  Write-Output "created lib$Dependency.lib from lib$Dependency.dll";

  ExecBash "rm lib$Dependency.def"
}

Copy-Item "prebuild/Windows/binding.gyp" "binding.gyp"
