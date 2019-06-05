import { HashMap } from 'jx-structs';

export class BizError extends Error {
  constructor( err = -3.14, msg = '为定义错误', name = 'BizError') {
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

  static Failure (err, msg) {
    return new BizError(err, msg)
  }

  static Success ( data ) {
    return new BizError(0, '操作成功')
  }
}

/**
 * @desc 错误组合，用于模块内预定义错误，根据key自动匹配
 */
export class BizErrorGroup {
  constructor () {
    this.errors = new HashMap();

    for (let arg of arguments) {
      this.errors.put(arg.err, arg);
    }
  }

  of (key) {
    let err = this.errors.get(key);

    if (!err) {
      // 使用方未定义该错误
      return new BizError();
    }

    return err;
  }
}


// 当前支付宝版本不支持某API的调用
export class APINotSupportedError extends Error {
  constructor(api) {
    super(`当前支付宝版本过低，无法使用${api ? api : '此功能'}，请升级最新版本的支付宝`)
    this.name = "APINotSupportedError"
  }
}