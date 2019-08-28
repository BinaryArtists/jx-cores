/**
 * Asyncable类
 * @desc 用作async/await中的阻塞与同志
 */
var __def_str = '...';
export var Asyncable = function(resolved = false) {
  if (resolved) {
    this._promise = Promise.resolve(__def_str);
  }
};

var _clzz = Asyncable;
var _inst = _clzz.prototype;

_inst._executor = function(resolve, reject) {
  _inst.resolve = resolve;
  _inst.reject = reject;
};

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


export const future = (fn) => {
  return new Promise(fn);
}