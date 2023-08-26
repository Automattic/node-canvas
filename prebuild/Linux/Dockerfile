FROM debian:bookworm as croco

RUN rm /etc/apt/sources.list.d/debian.sources
ADD sources.list /etc/apt/sources.list

RUN apt-get update
RUN apt-get -y install \
        curl \
        make \
        cmake \
        gcc \
        g++ \
        build-essential \
        clang \
        tar \
        bzip2 \
        pkg-config \
        libxml2-dev=2.9.14+dfsg-1.3~deb12u1 \
        libglib2.0-dev=2.74.6-2

WORKDIR /

RUN curl -LO https://download.gnome.org/sources/libcroco/0.6/libcroco-0.6.13.tar.xz ; \
    tar -xvf libcroco-0.6.13.tar.xz ; \
    cd libcroco-0.6.13 ; \
    ./configure --prefix=/croco-build ; \
    make ; \
    make install

RUN tar -czvf /croco-build.tgz /croco-build

FROM debian:bookworm as pax

RUN rm /etc/apt/sources.list.d/debian.sources
ADD sources.list /etc/apt/sources.list

RUN apt-get update
RUN apt-get -y install \
        curl \
        make \
        cmake \
        gcc \
        g++ \
        build-essential \
        clang \
        tar \
        bzip2 \
        pkg-config \
        git \
        meson

RUN git clone https://anongit.gentoo.org/git/proj/pax-utils.git /pax && \
    cd /pax && \
    meson _build --prefix=/pax-build && \
    ninja -C _build && \
    ninja -C _build install

RUN tar -czvf /pax-build.tgz /pax-build

FROM debian:bookworm as main

ARG PKG_CONFIG_VERSION=0.29.2-1
ARG ZLIB_VERSION=1:1.2.13.dfsg-1
ARG LIBFFI_VERSION=3.3-6
ARG OPENSSL_VERSION=1.1.1n-0+deb11u5
ARG PYTHON_VERSION=3.9.2-1
ARG PYTHON3_VERSION=3.9.2-3
ARG LIBPNG_VERSION=1.6.39-2
ARG FREETYPE_VERSION=2.12.1+dfsg-5
ARG HARFBUZZ_VERSION=6.0.0+dfsg-3
ARG LIBEXPAT_VERSION=2.2.10-2+deb11u5
ARG FONTCONFIG_VERSION=2.14.1-4
ARG PIXMAN_VERSION=0.42.2-1
ARG CAIRO_VERSION=1.16.0-7
ARG PANGO_VERSION=1.50.12+ds-1
ARG LIBXML_VERSION=2.9.14+dfsg-1.3~deb12u1
ARG GETTEXT_VERSION=0.21-12
ARG INTLTOOL_VERSION=0.51.0-6
ARG GDK_PIXBUF_VERSION=2.42.10+dfsg-1+b1
ARG RSVG_VERSION=2.54.5+dfsg-1
ARG GLIB_VERSION=2.74.6-2
ARG FRIBIDI_VERSION=1.0.8-2.1
ARG PCRE_VERSION=2:8.39-15

ENV TZ=Pacific/Los_Angeles
ENV DEBIAN_FRONTEND=noninteractive

RUN rm /etc/apt/sources.list.d/debian.sources
ADD sources.list /etc/apt/sources.list

RUN apt-get update
RUN apt-get -y --no-install-recommends install \
        pkg-config=${PKG_CONFIG_VERSION} \
        zlib1g=${ZLIB_VERSION} \
        zlib1g-dev=${ZLIB_VERSION} \
        libffi7=${LIBFFI_VERSION} \
        libffi-dev=${LIBFFI_VERSION} \
        openssl=${OPENSSL_VERSION} \
        libssl-dev=${OPENSSL_VERSION} \
        python3.9=${PYTHON_VERSION} \
        python3.9-dev=${PYTHON_VERSION} \
        libpng16-16=${LIBPNG_VERSION} \
        libpng-dev=${LIBPNG_VERSION} \
        libfreetype6=${FREETYPE_VERSION} \
        libfreetype6-dev=${FREETYPE_VERSION} \
        libharfbuzz0b=${HARFBUZZ_VERSION} \
        libharfbuzz-bin=${HARFBUZZ_VERSION} \
        libharfbuzz-dev=${HARFBUZZ_VERSION} \
        libharfbuzz-icu0=${HARFBUZZ_VERSION} \
        libharfbuzz-gobject0=${HARFBUZZ_VERSION} \
        gir1.2-harfbuzz-0.0=${HARFBUZZ_VERSION} \
        libexpat1=${LIBEXPAT_VERSION} \
        libexpat1-dev=${LIBEXPAT_VERSION} \
        libfontconfig1=${FONTCONFIG_VERSION} \
        libfontconfig1-dev=${FONTCONFIG_VERSION} \
        libpixman-1.0=${PIXMAN_VERSION} \
        libpixman-1-dev=${PIXMAN_VERSION} \
        libcairo2=${CAIRO_VERSION} \
        libcairo2-dev=${CAIRO_VERSION} \
        libpango1.0-0=${PANGO_VERSION} \
        libpango1.0-dev=${PANGO_VERSION} \
        libxml2=${LIBXML_VERSION} \
        libxml2-dev=${LIBXML_VERSION} \
        gettext=${GETTEXT_VERSION} \
        intltool=${INTLTOOL_VERSION} \
        libgdk-pixbuf-2.0-0=${GDK_PIXBUF_VERSION} \
        libgdk-pixbuf-2.0-dev=${GDK_PIXBUF_VERSION} \
        librsvg2-2=${RSVG_VERSION} \
        librsvg2-dev=${RSVG_VERSION} \
        libglib2.0-0=${GLIB_VERSION} \
        libglib2.0-dev=${GLIB_VERSION} \
        libfribidi0=${FRIBIDI_VERSION} \
        libfribidi-dev=${FRIBIDI_VERSION} \
        libpcre3=${PCRE_VERSION} \
        libpcre3-dev=${PCRE_VERSION} \
        wget \
        curl \
        bash \
        make \
        cmake \
        ninja-build \
        gcc \
        g++ \
        clang \
        build-essential \
        tar \
        xz-utils \
        bzip2 \
        git \
        unzip \
        jq \
        python-is-python3=${PYTHON_VERSION} \
        python-dev-is-python3=${PYTHON_VERSION} \
        python3-pip \
        python3-distutils=${PYTHON_VERSION} \
        python3-lib2to3=${PYTHON_VERSION} \
        python3-pyelftools \
        python3=${PYTHON3_VERSION} \
        python3-dev=${PYTHON3_VERSION} \
        python3-minimal=${PYTHON3_VERSION} \
        libpython3-stdlib=${PYTHON3_VERSION} \
        libpython3-dev=${PYTHON3_VERSION}

SHELL [ "/bin/bash", "-c" ]

RUN curl -Lo /gif.deb \
    "http://ftp.debian.org/debian/pool/main/g/giflib/libgif7_5.2.1-2.5_$(dpkg --print-architecture).deb"

RUN curl -Lo /gif-dev.deb \
    "http://ftp.debian.org/debian/pool/main/g/giflib/libgif-dev_5.2.1-2.5_$(dpkg --print-architecture).deb"

RUN curl -Lo /jpeg.deb \
    "http://ftp.debian.org/debian/pool/main/libj/libjpeg-turbo/libjpeg62-turbo_2.0.6-4_$(dpkg --print-architecture).deb"

RUN curl -Lo /jpeg-dev.deb \
    "http://ftp.debian.org/debian/pool/main/libj/libjpeg-turbo/libjpeg62-turbo-dev_2.0.6-4_$(dpkg --print-architecture).deb"

RUN curl -Lo /mime.deb \
    "http://ftp.debian.org/debian/pool/main/s/shared-mime-info/shared-mime-info_1.10-1_$(dpkg --print-architecture).deb"

RUN apt-get -y --no-install-recommends --allow-downgrades install \
        /gif.deb \
        /gif-dev.deb \
        /jpeg.deb \
        /jpeg-dev.deb \
        /mime.deb

RUN rm -f \
        /gif.deb \
        /gif-dev.deb \
        /jpeg.deb \
        /jpeg-dev.deb \
        /mime.deb

COPY --from=croco /croco-build.tgz /
COPY --from=pax /pax-build.tgz /

RUN tar -xzvf /croco-build.tgz -C /usr/local --strip-components 1
RUN tar -xzvf /pax-build.tgz -C /usr/local --strip-components 1

RUN rm -f \
        /croco-build.tgz \
        /pax-build.tgz

ENV CARGO_HOME=/opt/cargo
ENV RUSTUP_HOME=/opt/rustup

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
RUN chmod -R a+rwx /opt/cargo
RUN chmod -R a+rwx /opt/rustup

ENV PATH="/opt/cargo/bin:$PATH"

RUN curl -fsSL https://fnm.vercel.app/install | bash -s - --install-dir /opt/fnm

ENV PATH="/opt/fnm:$PATH"

RUN apt-get -y --no-install-recommends install \
        gcc-aarch64-linux-gnu \
        g++-aarch64-linux-gnu \
        binutils-aarch64-linux-gnu \
        gcc-x86-64-linux-gnu \
        g++-x86-64-linux-gnu \
        binutils-x86-64-linux-gnu

ADD gyp.sh /usr/local/bin/install-node-gyp
RUN chmod a+rx /usr/local/bin/install-node-gyp

ADD cross-env.sh /usr/local/bin/cross-env
RUN chmod a+rx /usr/local/bin/cross-env

FROM --platform=arm64 ghcr.io/redstonewizard08/node-canvas/prebuild as arm_sysroot

RUN tar -czf /arm-sysroot.tgz \
        /lib /usr/include /usr/lib \
        /usr/local/lib /usr/local/include

FROM --platform=amd64 main as x86_sysroot

RUN tar -czf /x86-sysroot.tgz \
        /lib /lib64 /usr/include /usr/lib \
        /usr/lib64 /usr/local/lib /usr/local/include

FROM main

RUN mkdir -p /usr/share/sysroots/aarch64-linux-gnu /usr/share/sysroots/x86_64-linux-gnu

COPY --from=arm_sysroot /arm-sysroot.tgz /usr/share/sysroots/arm-sysroot.tgz
COPY --from=x86_sysroot /x86-sysroot.tgz /usr/share/sysroots/x86-sysroot.tgz

RUN tar -xvf /usr/share/sysroots/arm-sysroot.tgz -C /usr/share/sysroots/aarch64-linux-gnu
RUN tar -xvf /usr/share/sysroots/x86-sysroot.tgz -C /usr/share/sysroots/x86_64-linux-gnu
RUN rm /usr/share/sysroots/arm-sysroot.tgz /usr/share/sysroots/x86-sysroot.tgz
