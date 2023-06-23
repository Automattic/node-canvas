# apt-get-style dependencies aren't done here since the
# linux build is done on a docker image that has them

git clone git://anongit.gentoo.org/proj/pax-utils.git -b v1.2.9
cd pax-utils
PATH=$PATH:$PWD
make
cd ..
