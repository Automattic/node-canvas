#include "lock.h"

UVLockHandle::UVLockHandle()
{
  uv_rwlock_init(&rw_lock);
  uv_mutex_init(&mutex);
}

UVLockHandle::~UVLockHandle()
{
  uv_rwlock_destroy(&rw_lock);
  uv_mutex_destroy(&mutex);
}

UVLocker::UVLocker(UVLockHandle &rwlock, LockerType t) : _type{t}
{
  handle = &rwlock;

  switch (t)
  {
  case rd:
    uv_rwlock_rdlock(&handle->rw_lock);
    break;

  case wr:
    uv_rwlock_wrlock(&handle->rw_lock);
    break;

  case mutex:
    uv_mutex_lock(&handle->mutex);
    break;
  }
}

UVLocker::~UVLocker()
{
  clean();
}

void UVLocker::clean()
{
  if (handle == nullptr)
    return;

  switch (_type)
  {
  case rd:
    uv_rwlock_rdunlock(&handle->rw_lock);
    break;

  case wr:
    uv_rwlock_wrunlock(&handle->rw_lock);
    break;

  case mutex:
    uv_mutex_unlock(&handle->mutex);
    break;
  }

  handle = nullptr;
}