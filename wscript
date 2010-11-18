import glob

srcdir = '.'
blddir = 'build'
VERSION = '0.0.1'

def set_options(opt):
  opt.tool_options('compiler_cxx')

def configure(conf):
  conf.check_tool('compiler_cxx')
  conf.check_tool('node_addon')
  conf.env.append_value('CPPFLAGS', '-DNDEBUG')
  if conf.check(lib='jpeg', uselib_store='JPEG', mandatory=False):
    conf.env.append_value('CPPFLAGS', '-DHAVE_JPEG=1')
  conf.check_cfg(package='cairo', args='--cflags --libs', mandatory=True)
  flags = ['-O3', '-Wall']
  conf.env.append_value('CCFLAGS', flags)
  conf.env.append_value('CXXFLAGS', flags)

def build(bld):
  obj = bld.new_task_gen('cxx', 'shlib', 'node_addon')
  obj.target = 'canvas'
  obj.source = bld.glob('src/*.cc')
  obj.uselib = ['CAIRO', 'JPEG']