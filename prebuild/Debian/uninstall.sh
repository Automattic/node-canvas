# FIXME: error if removing with build-essential libcairo2* libjpeg* libpango1.0* libgif* librsvg2* libpixman-1*
sudo apt-get purge -y build-essential libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev librsvg2-dev libpixman-1-dev
sudo apt-get autoremove --purge -y
