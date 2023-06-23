FROM debian:bullseye as pcre

RUN apt-get update
RUN cp /etc/apt/sources.list /etc/apt/sources.list.d/dev.list
RUN sed -i 's/^deb/deb-src/g' /etc/apt/sources.list.d/dev.list
RUN apt-get update
RUN apt-get -y build-dep libpcre3 libpcre3-dev
RUN apt-get -y install curl make cmake gcc g++ build-essential clang tar bzip2 pkg-config

WORKDIR /

RUN curl -LO https://download.sourceforge.net/pcre/pcre/8.44/pcre-8.44.tar.bz2 ; \
    tar -xvf pcre-8.44.tar.bz2 ; \
    cd pcre-8.44 ; \
    ./configure \
        --enable-pcre16 \
        --enable-pcre32 \
        --enable-utf \
        --enable-unicode-properties \
        --prefix=/pcre-build ; \
    make ; \
    make install

RUN tar -czvf /pcre-build.tgz /pcre-build

FROM debian:bullseye as glib

RUN apt-get update
RUN cp /etc/apt/sources.list /etc/apt/sources.list.d/dev.list
RUN sed -i 's/^deb/deb-src/g' /etc/apt/sources.list.d/dev.list
RUN apt-get update
RUN apt-get -y build-dep libglib2.0-0=2.66.8-1 libglib2.0-dev=2.66.8-1
RUN apt-get -y install curl make cmake gcc g++ build-essential clang tar bzip2 pkg-config

WORKDIR /

RUN curl -LO https://download.gnome.org/sources/glib/2.67/glib-2.67.1.tar.xz ; \
    tar -xvf glib-2.67.1.tar.xz ; \
    cd glib-2.67.1 ; \
    meson _build --prefix=/glib-build ; \
    cd _build ; \
    ninja ; \
    ninja install

RUN tar -czvf /glib-build.tgz /glib-build

FROM debian:bullseye as fribidi

RUN apt-get update
RUN cp /etc/apt/sources.list /etc/apt/sources.list.d/dev.list
RUN sed -i 's/^deb/deb-src/g' /etc/apt/sources.list.d/dev.list
RUN apt-get update
RUN apt-get -y build-dep libfribidi0=1.0.8-2+deb11u1 libfribidi-dev=1.0.8-2+deb11u1
RUN apt-get -y install curl make cmake gcc g++ build-essential clang tar bzip2 pkg-config

WORKDIR /

RUN curl -LO https://github.com/fribidi/fribidi/releases/download/v1.0.10/fribidi-1.0.10.tar.xz ; \
    tar -xvf fribidi-1.0.10.tar.xz ; \
    cd fribidi-1.0.10 ; \
    ./configure --prefix=/fribidi-build ; \
    make ; \
    make install

RUN tar -czvf /fribidi-build.tgz /fribidi-build

FROM debian:bullseye as croco

RUN apt-get update
RUN cp /etc/apt/sources.list /etc/apt/sources.list.d/dev.list
RUN sed -i 's/^deb/deb-src/g' /etc/apt/sources.list.d/dev.list
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
        libxml2-dev \
        libglib2.0-dev

COPY --from=glib /glib-build/* /usr/local

WORKDIR /

RUN curl -LO https://download.gnome.org/sources/libcroco/0.6/libcroco-0.6.13.tar.xz ; \
    tar -xvf libcroco-0.6.13.tar.xz ; \
    cd libcroco-0.6.13 ; \
    ./configure --prefix=/croco-build ; \
    make ; \
    make install

RUN tar -czvf /croco-build.tgz /croco-build

FROM debian:bullseye

ARG PKG_CONFIG_VERSION=0.29.2-1
ARG ZLIB_VERSION=1:1.2.11.dfsg-2+deb11u2
ARG LIBFFI_VERSION=3.3-6
ARG OPENSSL_VERSION=1.1.1n-0+deb11u5
ARG PYTHON_VERSION=3.9.2-1
ARG LIBPNG_VERSION=1.6.37-3
ARG FREETYPE_VERSION=2.10.4+dfsg-1+deb11u1
ARG HARFBUZZ_VERSION=2.7.4-1
ARG LIBEXPAT_VERSION=2.2.10-2+deb11u5
ARG FONTCONFIG_VERSION=2.13.1-4.2
ARG PIXMAN_VERSION=0.40.0-1.1~deb11u1
ARG CAIRO_VERSION=1.16.0-5
ARG PANGO_VERSION=1.46.2-3
ARG LIBXML_VERSION=2.9.10+dfsg-6.7+deb11u4
ARG GETTEXT_VERSION=0.21-4
ARG INTLTOOL_VERSION=0.51.0-6
ARG GDK_PIXBUF_VERSION=2.42.2+dfsg-1+deb11u1
ARG RSVG_VERSION=2.50.3+dfsg-1

ENV TZ=Pacific/Los_Angeles
ENV DEBIAN_FRONTEND=noninteractive

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
        wget \
        curl \
        bash

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

COPY --from=pcre /pcre-build.tgz /
COPY --from=glib /glib-build.tgz /
COPY --from=fribidi /fribidi-build.tgz /
COPY --from=croco /croco-build.tgz /

RUN tar -xzvf /pcre-build.tgz -C /usr/local --strip-components 1
RUN tar -xzvf /glib-build.tgz -C /usr/local --strip-components 1
RUN tar -xzvf /fribidi-build.tgz -C /usr/local --strip-components 1
RUN tar -xzvf /croco-build.tgz -C /usr/local --strip-components 1

RUN rm -f \
        pcre-build.tgz \
        glib-build.tgz \
        fribidi-build.tgz \
        croco-build.tgz

ENV CARGO_HOME=/opt/cargo
ENV RUSTUP_HOME=/opt/rustup

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
RUN chmod -R a+rwx /opt/cargo
RUN chmod -R a+rwx /opt/rustup

ENV PATH="/opt/cargo/bin:$PATH"
