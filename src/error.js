import { BizEnum, BizEnumGroup } from './enum';

export class BizError extends Error {
  constructor( err = -3.14, msg = '未定义错误', name = '未知业务') {
    super(msg);

    this.err = err;
    this.msg = msg;
    this.name = name;
    this.data = null;
  }

  named (name) {
    this.name = name;
    return this;
  }
  err (err) { 
    this.err = err
    return this;
  }
  msg (msg) { 
    this.msg = msg;
    return this;
  }

  is (value) {
    if (typeof value === 'number') {
      return value == this.err;
    } else if (typeof value === 'string') {
      return value == this.name;
    }

    return false;
  }

  static Failure (err, msg) {
    if (BizEnum.is(err)) {
      return new BizError(err.id, err.msg, '失败返回体');
    }

    return new BizError(err, msg, '失败返回体');
  }

  static Success ( data ) {
    let err = new BizError(0, '操作成功', '成功返回体');
    err.data = data;
    return err;
  }
}

/**
 * @desc api无法使用错误
 * @param {string} apiname api名字
 */
export const APINotSupportedError = (apiname) => 
  new BizError(-1000, `当前版本过低，无法使用${apiname ? apiname : '某功能'}，请升级`, 'APINotSupportedError');