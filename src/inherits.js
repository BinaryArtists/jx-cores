export function isFunction(x) {
  return typeof (x) === 'function';
}

export function create(prototype) {
  var F = function (){};
  F.prototype = prototype;
  return new F();
}

export function setPrototypeOf(C, P, force) {
  // 静态属性继承，慎用，有坑
  if (Object.setPrototypeOf) {
    // setPrototypeOf es6
    Object.setPrototypeOf(C, P);
  } else if (C.__proto__) {
    // __proto__ es6引入，但是部分浏览器早已支持
    C.__proto__ = P;
  } else if (force) {
    // 兼容ie10-等陈旧浏览器
    // 将P上的静态属性和方法拷贝一份到C上，不会覆盖C上的方法
    for (var k in P) {
      if (P.hasOwnProperty(k) && !(k in C)) {
        C[k] = P[k];
      }
    }
  }
}

export function inherits(C /** class */ , P /** super class */ ) {
  // 如果不为函数，则不进行操作
  if (!isFunction(C)) {
    throw new TypeError('inherits first param must is function');
  }

  if (!isFunction(P)) {
    throw new TypeError('inherits second param must is function');
  }

  // 等同于临时构造函数
  C.prototype = Object.create(P.prototype);
  // C.prototype = create(P.prototype);

  C.prototype.constructor = C; // 修复constructor
  C.uper = P;//存储超类

  // 静态属性继承，慎用，有坑，无法兼容10-
  setPrototypeOf(C, P);
}
