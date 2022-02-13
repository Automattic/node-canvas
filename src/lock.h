#include "uv.h"

class UVLockHandle
{
public:
  uv_rwlock_t rw_lock;
  uv_mutex_t mutex;
  UVLockHandle();
  ~UVLockHandle();
};

/**
 * [RAII] Promise to unlock when there are exception throw
 */
class UVLocker
{

public:
  enum LockerType
  {
    rd = 0,
    wr,
    mutex
  };

  UVLocker(UVLockHandle &, LockerType);
  ~UVLocker();

  void clean();

private:
  UVLockHandle *handle;
  LockerType _type;
};