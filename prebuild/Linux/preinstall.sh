# apt-get-style dependencies aren't done here since the
# linux build is done on a docker image that has them

# @RedstoneWizard08: This is done in the Docker image now,
#                    so this is unnecessary and causes errors.
# ============================================================
# git clone git://anongit.gentoo.org/proj/pax-utils.git
# cd pax-utils
# PATH=$PATH:$PWD
# make
# cd ..
# ============================================================
