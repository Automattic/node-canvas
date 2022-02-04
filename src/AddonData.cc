#include "AddonData.h"

AddonData::AddonData()
{
  node::AddEnvironmentCleanupHook(v8::Isolate::GetCurrent(), Dispose, this);
}

void AddonData::Dispose(void* ins)
{
  AddonData *data = static_cast<AddonData*>(ins);
  data->canvas_ctor_tpl.Reset();
  data->context2d_ctor_tpl.Reset();
  data->context2d_dom_matrix.Reset();
  data->context2d_parse_font.Reset();
  data->gradient_ctor_tpl.Reset();
  data->image_ctor_tpl.Reset();
  data->image_data_ctor_tpl.Reset();
  data->image_backend_ctor_tpl.Reset();
  data->pdf_backend_ctor_tpl.Reset();
  data->svg_backend_ctor_tpl.Reset();
  data->pattern_ctor_tpl.Reset();
  data->pattern_dom_matrix.Reset();

  delete data;
}