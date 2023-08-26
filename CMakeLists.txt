cmake_minimum_required(VERSION 3.22)
cmake_policy(SET CMP0091 NEW)
cmake_policy(SET CMP0042 NEW)

find_package(PkgConfig REQUIRED)

pkg_check_modules(PIXMAN1 REQUIRED pixman-1)
pkg_check_modules(CAIRO REQUIRED cairo)
pkg_check_modules(LIBPNG REQUIRED libpng)
pkg_check_modules(PANGOCAIRO REQUIRED pangocairo)
pkg_check_modules(FREETYPE2 REQUIRED freetype2)

if(WIN32)
    set(GTK_ROOT "C:/GTK")
    set(GIF_FOUND FALSE)
    set(LIBRSVG_FOUND FALSE)

    execute_process(COMMAND node ./util/win_jpeg_lookup.js OUTPUT_VARIABLE JPEG_ROOT)

    if(JPEG_ROOT STREQUAL "")
        set(LIBJPEG_FOUND FALSE)
    else()
        set(LIBJPEG_FOUND TRUE)
    endif()
else()
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wno-cast-function-type -fexceptions -fpermissive")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fexceptions -fpermissive")

    pkg_check_modules(LIBJPEG libjpeg)
    pkg_check_modules(GIF gif)
    pkg_check_modules(LIBRSVG librsvg-2.0)
endif()

execute_process(COMMAND node -e "require('nan')" OUTPUT_VARIABLE NAN_INCLUDE_DIR)

project(canvas)

# add_definitions(-DNAPI_VERSION=4)

include_directories(
    ${CMAKE_JS_INC}
    ${PIXMAN1_INCLUDE_DIRS}
    ${CAIRO_INCLUDE_DIRS}
    ${LIBPNG_INCLUDE_DIRS}
    ${PANGOCAIRO_INCLUDE_DIRS}
    ${FREETYPE2_INCLUDE_DIRS}
    ${NAN_INCLUDE_DIR}
)

add_library(
    ${PROJECT_NAME} SHARED
    src/backend/Backend.cc
    src/backend/ImageBackend.cc
    src/backend/PdfBackend.cc
    src/backend/SvgBackend.cc
    src/bmp/BMPParser.cc
    src/Backends.cc
    src/Canvas.cc
    src/CanvasGradient.cc
    src/CanvasPattern.cc
    src/CanvasRenderingContext2d.cc
    src/closure.cc
    src/color.cc
    src/Image.cc
    src/ImageData.cc
    src/init.cc
    src/register_font.cc
    ${CMAKE_JS_SRC}
)

set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")

target_link_libraries(
    ${PROJECT_NAME}
    ${CMAKE_JS_LIB}
    ${PIXMAN1_LIBRARIES}
    ${CAIRO_LIBRARIES}
    ${LIBPNG_LIBRARIES}
    ${PANGOCAIRO_LIBRARIES}
    ${FREETYPE2_LIBRARIES}
)

if(LIBJPEG_FOUND)
    if(WIN32)
        include_directories("${JPEG_ROOT}/include")
        target_link_libraries(${PROJECT_NAME} "${JPEG_ROOT}/lib/jpeg.lib")
    else()
        include_directories(${LIBJPEG_INCLUDE_DIRS})
        target_link_libraries(${PROJECT_NAME} ${LIBJPEG_LIBRARIES})
    endif()

    add_definitions(-DHAVE_JPEG)
endif()

if(GIF_FOUND)
    if(WIN32)
        target_link_libraries(${PROJECT_NAME} "${GTK_ROOT}/lib/gif.lib")
    elseif(APPLE)
        include_directories("/opt/homebrew/include")
        target_link_directories("/opt/homebrew/lib")
        target_link_libraries(${PROJECT_NAME} "gif")
    else()
        include_directories(${GIF_INCLUDE_DIRS})
        target_link_libraries(${PROJECT_NAME} ${GIF_LIBRARIES})
    endif()

    add_definitions(-DHAVE_GIF)
endif()

if(LIBRSVG_FOUND)
    if(WIN32)
        target_link_libraries(${PROJECT_NAME} "${GTK_ROOT}/lib/librsvg-2-2.lib")
    else()
        include_directories(${LIBRSVG_INCLUDE_DIRS})
        target_link_libraries(${PROJECT_NAME} ${LIBRSVG_LIBRARIES})
    endif()

    add_definitions(-DHAVE_RSVG)
endif()

if(MSVC)
    target_compile_options(${TARGET_NAME} PRIVATE /W4 /WX /w44100 /w44611)
endif()

if(WIN32)
    add_definitions(-D_USE_MATH_DEFINES)
    add_definitions(-DNOMINMAX)

    target_link_libraries(
        ${PROJECT_NAME}
        "${GTK_ROOT}/lib/cairo.lib"
        "${GTK_ROOT}/lib/libpng.lib"
        "${GTK_ROOT}/lib/pangocairo-1.0.lib"
        "${GTK_ROOT}/lib/pango-1.0.lib"
        "${GTK_ROOT}/lib/freetype.lib"
        "${GTK_ROOT}/lib/glib-2.0.lib"
        "${GTK_ROOT}/lib/gobject-2.0.lib"
    )

    include_directories(
        "${GTK_ROOT}/include"
        "${GTK_ROOT}/include/cairo"
        "${GTK_ROOT}/include/pango-1.0"
        "${GTK_ROOT}/include/glib-2.0"
        "${GTK_ROOT}/include/freetype2"
        "${GTK_ROOT}/lib/glib-2.0/include"
    )

    install(
        FILES
            "${GTK_ROOT}/bin/zlib1.dll"
            "${GTK_ROOT}/bin/libintl-8.dll"
            "${GTK_ROOT}/bin/libpng14-14.dll"
            "${GTK_ROOT}/bin/libpangocairo-1.0-0.dll"
            "${GTK_ROOT}/bin/libpango-1.0-0.dll"
            "${GTK_ROOT}/bin/libpangoft2-1.0-0.dll"
            "${GTK_ROOT}/bin/libpangowin32-1.0-0.dll"
            "${GTK_ROOT}/bin/libcairo-2.dll"
            "${GTK_ROOT}/bin/libfontconfig-1.dll"
            "${GTK_ROOT}/bin/libfreetype-6.dll"
            "${GTK_ROOT}/bin/libglib-2.0-0.dll"
            "${GTK_ROOT}/bin/libgobject-2.0-0.dll"
            "${GTK_ROOT}/bin/libgmodule-2.0-0.dll"
            "${GTK_ROOT}/bin/libgthread-2.0-0.dll"
            "${GTK_ROOT}/bin/libexpat-1.dll"
        DESTINATION
            "${CMAKE_INSTALL_PREFIX}"
    )

    if(LIBRSVG_FOUND)
        install(
            FILES
                "${GTK_ROOT}/bin/librsvg-2-2.dll"
                "${GTK_ROOT}/bin/libgdk_pixbuf-2.0-0.dll"
                "${GTK_ROOT}/bin/libgio-2.0-0.dll"
                "${GTK_ROOT}/bin/libcroco-0.6-3.dll"
                "${GTK_ROOT}/bin/libgsf-1-114.dll"
                "${GTK_ROOT}/bin/libxml2-2.dll"
            DESTINATION
                "${CMAKE_INSTALL_PREFIX}"
        )
    endif()

    if(LIBJPEG_FOUND)
        install(
            FILES
                "${JPEG_ROOT}/bin/jpeg62.dll"
            DESTINATION
                "${CMAKE_INSTALL_PREFIX}"
        )
    endif()
endif()

if(MSVC AND CMAKE_JS_NODELIB_DEF AND CMAKE_JS_NODELIB_TARGET)
    execute_process(COMMAND ${CMAKE_AR} /def:${CMAKE_JS_NODELIB_DEF} /out:${CMAKE_JS_NODELIB_TARGET} ${CMAKE_STATIC_LINKER_FLAGS})
endif()
