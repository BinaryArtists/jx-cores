/**
 * @module Asyncable类
 * @desc 用作async/await中的阻塞与同志
 */
var __def_str = '...';
var Asyncable = function(resolved = false) {
  if (resolved) {
    this._promise = Promise.resolve(__def_str);
  }
};

var _clz = Asyncable; // 加入它的方法，表示类方法
var _inst = _clz.prototype; // 加入它的方法，表示实例方法

_inst._executor = function(resolve, reject) {
  // 函数会被其他对象调用，所以这里不可使用this!!!!!!!!!!!!!
  _inst.resolve = resolve;
  _inst.reject = reject;
};

/**
 * @return Promise对象
 */
_inst.promisely = function() {
  if (!this._promise) {
    this._promise = new Promise(this._executor);
  }
  return this._promise;
};

_inst.then = function(msg = __def_str) {
  this.resolve(msg);
};

_inst.fail = function(msg = __def_str) {
  this.reject(new Error(msg));
};

module.exports = _clz;
