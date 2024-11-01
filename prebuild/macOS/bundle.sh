build=build/Release

# remove the big artifacts we will not use.
rm -r build/Release/.deps
rm -r build/Release/obj.target

~/Library/Python/*/bin/macpack build/Release/canvas.node -d .

