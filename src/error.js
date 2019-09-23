import { BizEnum, BizEnumGroup } from './enum';

// 统一解包: let { err, msg, data, biz } = obj;

/**
 * 业务错误
 */
export class BizError extends Error {
  constructor( err = -3.14, msg = '未定义错误', biz = '未知业务') {
    super(msg);

    this.err = err;
    this.msg = msg;
    this.biz = biz;
    this.data = null;
  }

  is (value) {
    if (typeof value === 'number') {
      return value == this.err;
    } else if (typeof value === 'string') {
      return value == this.biz;
    }

    return false;
  }

  /** [已废弃] */
  static Failure (err, msg) {
    if (BizEnum.is(err)) {
      return new BizError(err.id, err.msg, '失败返回体');
    }

    return new BizError(err, msg, '失败返回体');
  }

  /** [已废弃] */
  static Success ( data ) {
    let err = new BizError(0, '操作成功', '成功返回体');
    err.data = data;
    return err;
  }
}

/**
 * 业务返回体
 */
export class BizResult extends BizError {
  constructor (data = null, msg = '未定义返回', biz = '未知业务') {
    super(null, msg, biz);

    this.data = data;
  }

  static Err (err, msg) {
    if (BizEnum.is(err)) {
      return new BizError(err.id, err.msg);
    }

    return new BizError(err, msg);
  }

  static Ok ( data ) {
    return new BizResult(data, '操作成功');
  }
}