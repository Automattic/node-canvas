# dependency walker will help us figure out which DLLs 
# canvas.node directly and indirectly uses
wget --no-verbose --no-clobber http://www.dependencywalker.com/depends22_x64.zip
unzip -u depends22_x64.zip

# write recurisve dependencies of canvas.node into depends.csv
./depends -c -oc:depends.csv build/Release/canvas.node;

[ -f depends.csv ] || {
  echo "error invoking depends.exe";
  exit 1;
}

# case-insensitive intersection of 2nd column of depends.csv
# and all files ending in .dll in the mingw64 directory
copies=$(comm -12 \
  <(cat depends.csv | cut -d ',' -f2 | sed 's/"//g' | tr '[:upper:]' '[:lower:]' | sort) \
  <(find /mingw64/bin -name '*.dll' -printf "%f\n" | tr '[:upper:]' '[:lower:]' | sort) \
);

for dll in $copies; do
  cp /mingw64/bin/$dll build/Release
done;
