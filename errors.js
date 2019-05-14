// http://wiki.jikexueyuan.com/project/iojs-api-doc/errors.html

var HashMap = require('../struct/hashmap')

export class BizError extends Error {
  constructor( err = -999, msg = '出错了，稍后再试', name = 'BizError') {
    super(msg)

    this.err = err
    this.msg = msg
    this.name = name
  }

  named (name) {
    this.name = name
  }

  err (err) { 
    this.err = err
    return this
  }
  msg (msg) { 
    this.msg = msg
    return this 
  }

  is (str) {
    return str == this.name
  }
}

/**
 * @desc 错误组合，用于自动匹配
 */
export class BizErrors {
  constructor () {
    this.errors = new HashMap()

    for (let arg of arguments) {
      this.errors.put(arg.err, arg)

      // FIXME:
      // 如果错误对象有name，则给this进行扩展
    }
  }

  of (key) {
    let err = this.errors.get(key)

    if (!err) {
      // 使用方未定义该错误
      return new BizError()
    }

    return err
  }
}

export class SuccessError extends Error {
  constructor( data ) {
    super('success message')

    this.data = data
  }

  data ( data ) {
    this.data = data

    return this
  }
}

export default {
  make ( err, msg, name ) {
    if ( !err && !msg && !name) return new BizError()
  
    return new BizError( err, msg, name )
  },
  makeDefault () {
    return this.make()
  }
}

// 当前支付宝版本不支持某API的调用
export class APINotSupportedError extends Error {
  constructor(api) {
    super(`当前支付宝版本过低，无法使用${api ? api : '此功能'}，请升级最新版本的支付宝`)
    this.name = "APINotSupportedError"
  }
}