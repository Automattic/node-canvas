# apt-get-style dependencies aren't done here since the
# linux build is done on a docker image that has them

# ... except for libseccomp, which could go in the docker image, but for now I
# don't want to rebuild it.
apt-get install -y libseccomp2 libseccomp-dev

git clone git://anongit.gentoo.org/proj/pax-utils.git
cd pax-utils
# the last commit before they changed from make to meson
git checkout d9f65269d7182ef1d313e3b87bcea37e45958561
PATH=$PATH:$PWD
make
cd ..
