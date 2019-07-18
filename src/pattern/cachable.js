var __cache__ = null;

export function Cachable(key, needDisk = true) {
  this.key = key;

  this.needDisk = needDisk;
}

/**
 * @desc 类方法 设置缓存句柄
 *
 * @example
 *    cache 三个基本操作符 get, set, rm
 */
Cachable.config = function(cache) {
  __cache__ = cache;
};

/**
 * @desc 实例方法 定义三个基本操作符
 */
Object.assign(Cachable.prototype, {
  get() {
    return this.needDisk ? __cache__.get(this.key) : this.val;
  },
  set(val) {
    if (this.needDisk) {
      __cache__.set(this.key, val);
    } else {
      this.val = val;
    }
  },
  rm() {
    this.needDisk ? __cache__.rm(this.key) : (this.val = null);
  },
});
