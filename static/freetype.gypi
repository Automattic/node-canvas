{
  'includes': ['common.gypi', 'locations.gypi'],
  'targets': [
    {
      'target_name': 'freetype',
      'type': 'static_library',
      'include_dirs': ['<(freetype_root)include/'],

      'defines': ['FT2_BUILD_LIBRARY'],
      'sources': [
        #"<(freetype_root)src/autofit/afangles.c",
        #"<(freetype_root)src/autofit/afcjk.c",
        #"<(freetype_root)src/autofit/afdummy.c",
        #"<(freetype_root)src/autofit/afglobal.c",
        #"<(freetype_root)src/autofit/afhints.c",
        #"<(freetype_root)src/autofit/afindic.c",
        #"<(freetype_root)src/autofit/aflatin2.c",
        #"<(freetype_root)src/autofit/aflatin.c",
        #"<(freetype_root)src/autofit/afloader.c",
        #"<(freetype_root)src/autofit/afmodule.c",
        #"<(freetype_root)src/autofit/afpic.c",
        #"<(freetype_root)src/autofit/afwarp.c",
        "<(freetype_root)src/autofit/autofit.c",

        #"<(freetype_root)src/base/basepic.c",
        #"<(freetype_root)src/base/ftadvanc.c",
        #"<(freetype_root)src/base/ftapi.c",
        "<(freetype_root)src/base/ftbase.c",
        #"<(freetype_root)src/base/ftbbox.c",
        "<(freetype_root)src/base/ftbdf.c",
        "<(freetype_root)src/base/ftbitmap.c",
        #"<(freetype_root)src/base/ftcalc.c",
        #"<(freetype_root)src/base/ftcid.c",
        #"<(freetype_root)src/base/ftdbgmem.c",
        #"<(freetype_root)src/base/ftdebug.c",
        "<(freetype_root)src/base/ftfntfmt.c",
        #"<(freetype_root)src/base/ftfstype.c",
        #"<(freetype_root)src/base/ftgasp.c",
        #"<(freetype_root)src/base/ftgloadr.c",
        #"<(freetype_root)src/base/ftglyph.c",
        #"<(freetype_root)src/base/ftgxval.c",
        "<(freetype_root)src/base/ftinit.c",
        "<(freetype_root)src/base/ftlcdfil.c",
        #"<(freetype_root)src/base/ftmac.c",
        #"<(freetype_root)src/base/ftmm.c",
        #"<(freetype_root)src/base/ftobjs.c",
        #"<(freetype_root)src/base/ftotval.c",
        #"<(freetype_root)src/base/ftoutln.c",
        #"<(freetype_root)src/base/ftpatent.c",
        #"<(freetype_root)src/base/ftpfr.c",
        #"<(freetype_root)src/base/ftpic.c",
        #"<(freetype_root)src/base/ftrfork.c",
        #"<(freetype_root)src/base/ftsnames.c",
        #"<(freetype_root)src/base/ftstream.c",
        #"<(freetype_root)src/base/ftstroke.c",
        "<(freetype_root)src/base/ftsynth.c",
        "<(freetype_root)src/base/ftsystem.c",
        #"<(freetype_root)src/base/fttrigon.c",
        "<(freetype_root)src/base/fttype1.c",
        #"<(freetype_root)src/base/ftutil.c",
        #"<(freetype_root)src/base/ftwinfnt.c",
        #"<(freetype_root)src/base/ftxf86.c",
        #"<(freetype_root)src/base/md5.c",

        "<(freetype_root)src/bdf/bdf.c",
        #"<(freetype_root)src/bdf/bdfdrivr.c",
        #"<(freetype_root)src/bdf/bdflib.c",

        "<(freetype_root)src/bzip2/ftbzip2.c",

        "<(freetype_root)src/cache/ftcache.c",
        #"<(freetype_root)src/cache/ftcbasic.c",
        #"<(freetype_root)src/cache/ftccache.c",
        #"<(freetype_root)src/cache/ftccmap.c",
        #"<(freetype_root)src/cache/ftcglyph.c",
        #"<(freetype_root)src/cache/ftcimage.c",
        #"<(freetype_root)src/cache/ftcmanag.c",
        #"<(freetype_root)src/cache/ftcmru.c",
        #"<(freetype_root)src/cache/ftcsbits.c",

        #"<(freetype_root)src/cff/cf2arrst.c",
        #"<(freetype_root)src/cff/cf2blues.c",
        #"<(freetype_root)src/cff/cf2error.c",
        #"<(freetype_root)src/cff/cf2font.c",
        #"<(freetype_root)src/cff/cf2ft.c",
        #"<(freetype_root)src/cff/cf2hints.c",
        #"<(freetype_root)src/cff/cf2intrp.c",
        #"<(freetype_root)src/cff/cf2read.c",
        #"<(freetype_root)src/cff/cf2stack.c",
        "<(freetype_root)src/cff/cff.c",
        #"<(freetype_root)src/cff/cffcmap.c",
        #"<(freetype_root)src/cff/cffdrivr.c",
        #"<(freetype_root)src/cff/cffgload.c",
        #"<(freetype_root)src/cff/cffload.c",
        #"<(freetype_root)src/cff/cffobjs.c",
        #"<(freetype_root)src/cff/cffparse.c",
        #"<(freetype_root)src/cff/cffpic.c",

        #"<(freetype_root)src/cid/cidgload.c",
        #"<(freetype_root)src/cid/cidload.c",
        #"<(freetype_root)src/cid/cidobjs.c",
        #"<(freetype_root)src/cid/cidparse.c",
        #"<(freetype_root)src/cid/cidriver.c",
        "<(freetype_root)src/cid/type1cid.c",

        "<(freetype_root)src/gxvalid/gxvalid.c",
        #"<(freetype_root)src/gxvalid/gxvbsln.c",
        #"<(freetype_root)src/gxvalid/gxvcommn.c",
        #"<(freetype_root)src/gxvalid/gxvfeat.c",
        #"<(freetype_root)src/gxvalid/gxvfgen.c",
        #"<(freetype_root)src/gxvalid/gxvjust.c",
        #"<(freetype_root)src/gxvalid/gxvkern.c",
        #"<(freetype_root)src/gxvalid/gxvlcar.c",
        #"<(freetype_root)src/gxvalid/gxvmod.c",
        #"<(freetype_root)src/gxvalid/gxvmort0.c",
        #"<(freetype_root)src/gxvalid/gxvmort1.c",
        #"<(freetype_root)src/gxvalid/gxvmort2.c",
        #"<(freetype_root)src/gxvalid/gxvmort4.c",
        #"<(freetype_root)src/gxvalid/gxvmort5.c",
        #"<(freetype_root)src/gxvalid/gxvmort.c",
        #"<(freetype_root)src/gxvalid/gxvmorx0.c",
        #"<(freetype_root)src/gxvalid/gxvmorx1.c",
        #"<(freetype_root)src/gxvalid/gxvmorx2.c",
        #"<(freetype_root)src/gxvalid/gxvmorx4.c",
        #"<(freetype_root)src/gxvalid/gxvmorx5.c",
        #"<(freetype_root)src/gxvalid/gxvmorx.c",
        #"<(freetype_root)src/gxvalid/gxvopbd.c",
        #"<(freetype_root)src/gxvalid/gxvprop.c",
        #"<(freetype_root)src/gxvalid/gxvtrak.c",

        #"<(freetype_root)src/gzip/adler32.c",
        "<(freetype_root)src/gzip/ftgzip.c",
        #"<(freetype_root)src/gzip/infblock.c",
        #"<(freetype_root)src/gzip/infcodes.c",
        #"<(freetype_root)src/gzip/inflate.c",
        #"<(freetype_root)src/gzip/inftrees.c",
        #"<(freetype_root)src/gzip/infutil.c",
        #"<(freetype_root)src/gzip/zutil.c",

        "<(freetype_root)src/lzw/ftlzw.c",
        #"<(freetype_root)src/lzw/ftzopen.c",

        "<(freetype_root)src/otvalid/otvalid.c",
        #"<(freetype_root)src/otvalid/otvbase.c",
        #"<(freetype_root)src/otvalid/otvcommn.c",
        #"<(freetype_root)src/otvalid/otvgdef.c",
        #"<(freetype_root)src/otvalid/otvgpos.c",
        #"<(freetype_root)src/otvalid/otvgsub.c",
        #"<(freetype_root)src/otvalid/otvjstf.c",
        #"<(freetype_root)src/otvalid/otvmath.c",
        #"<(freetype_root)src/otvalid/otvmod.c",

        "<(freetype_root)src/pcf/pcf.c",
        #"<(freetype_root)src/pcf/pcfdrivr.c",
        #"<(freetype_root)src/pcf/pcfread.c",
        #"<(freetype_root)src/pcf/pcfutil.c",

        "<(freetype_root)src/pfr/pfr.c",
        #"<(freetype_root)src/pfr/pfrcmap.c",
        #"<(freetype_root)src/pfr/pfrdrivr.c",
        #"<(freetype_root)src/pfr/pfrgload.c",
        #"<(freetype_root)src/pfr/pfrload.c",
        #"<(freetype_root)src/pfr/pfrobjs.c",
        #"<(freetype_root)src/pfr/pfrsbit.c",

        #"<(freetype_root)src/psaux/afmparse.c",
        "<(freetype_root)src/psaux/psaux.c",
        #"<(freetype_root)src/psaux/psauxmod.c",
        #"<(freetype_root)src/psaux/psconv.c",
        #"<(freetype_root)src/psaux/psobjs.c",
        #"<(freetype_root)src/psaux/t1cmap.c",
        #"<(freetype_root)src/psaux/t1decode.c",

        #"<(freetype_root)src/pshinter/pshalgo.c",
        #"<(freetype_root)src/pshinter/pshglob.c",
        "<(freetype_root)src/pshinter/pshinter.c",
        #"<(freetype_root)src/pshinter/pshmod.c",
        #"<(freetype_root)src/pshinter/pshpic.c",
        #"<(freetype_root)src/pshinter/pshrec.c",

        #"<(freetype_root)src/psnames/psmodule.c",
        "<(freetype_root)src/psnames/psnames.c",
        #"<(freetype_root)src/psnames/pspic.c",

        #"<(freetype_root)src/raster/ftraster.c",
        #"<(freetype_root)src/raster/ftrend1.c",
        "<(freetype_root)src/raster/raster.c",
        #"<(freetype_root)src/raster/rastpic.c",

        #"<(freetype_root)src/sfnt/pngshim.c",
        #"<(freetype_root)src/sfnt/sfdriver.c",
        "<(freetype_root)src/sfnt/sfnt.c",
        #"<(freetype_root)src/sfnt/sfntpic.c",
        #"<(freetype_root)src/sfnt/sfobjs.c",
        #"<(freetype_root)src/sfnt/ttbdf.c",
        #"<(freetype_root)src/sfnt/ttcmap.c",
        #"<(freetype_root)src/sfnt/ttkern.c",
        #"<(freetype_root)src/sfnt/ttload.c",
        #"<(freetype_root)src/sfnt/ttmtx.c",
        #"<(freetype_root)src/sfnt/ttpost.c",
        #"<(freetype_root)src/sfnt/ttsbit.c",

        #"<(freetype_root)src/smooth/ftgrays.c",
        #"<(freetype_root)src/smooth/ftsmooth.c",
        #"<(freetype_root)src/smooth/ftspic.c",
        "<(freetype_root)src/smooth/smooth.c",

        "<(freetype_root)src/tools/apinames.c",
        "<(freetype_root)src/tools/ftrandom/ftrandom.c",
        "<(freetype_root)src/tools/test_afm.c",
        "<(freetype_root)src/tools/test_bbox.c",
        "<(freetype_root)src/tools/test_trig.c",

        "<(freetype_root)src/truetype/truetype.c",
        #"<(freetype_root)src/truetype/ttdriver.c",
        #"<(freetype_root)src/truetype/ttgload.c",
        #"<(freetype_root)src/truetype/ttgxvar.c",
        #"<(freetype_root)src/truetype/ttinterp.c",
        #"<(freetype_root)src/truetype/ttobjs.c",
        #"<(freetype_root)src/truetype/ttpic.c",
        #"<(freetype_root)src/truetype/ttpload.c",
        #"<(freetype_root)src/truetype/ttsubpix.c",

        #"<(freetype_root)src/type1/t1afm.c",
        #"<(freetype_root)src/type1/t1driver.c",
        #"<(freetype_root)src/type1/t1gload.c",
        #"<(freetype_root)src/type1/t1load.c",
        #"<(freetype_root)src/type1/t1objs.c",
        #"<(freetype_root)src/type1/t1parse.c",
        "<(freetype_root)src/type1/type1.c",

        #"<(freetype_root)src/type42/t42drivr.c",
        #"<(freetype_root)src/type42/t42objs.c",
        #"<(freetype_root)src/type42/t42parse.c",
        "<(freetype_root)src/type42/type42.c",

        "<(freetype_root)src/winfonts/winfnt.c",
      ],
    },
  ]
}
