import { Assert } from './assert';

/**
 * @desc 枚举
 */
export class BizEnum {
  /**
   * 
   * @param {int} id 
   * @param {string} msg 
   */
  constructor (id, msg) {
    this.id = id;
    this.msg = msg;

    // 断言
    Assert.number(id, 'BizEnum.id 必须为 number');
    Assert.string(msg, 'BizEnum.msg 必须为 string');

    if (Object.freeze)
      Object.freeze(this);
  }

  /**
   * @desc 枚举等价
   * @param {id, string} idOrMsg 
   */
  equal (idOrMsg) {
    if (typeof idOrMsg === 'number') {
      return this.id === idOrMsg;
    } else if (typeof idOrMsg === 'string') {
      return this.msg === idOrMsg;
    }

    return false;
  }

  /**
   * @desc 鸭子类型 长得像/叫的像，那就是了。
   */
  static is (bizEnumOrNot) {
    return bizEnumOrNot.id != undefined && bizEnumOrNot.msg != undefined;
  }
  
  /**
   * @desc 枚举便携构造
   * @param {int} id 
   * @param {string} msg 
   */
  static of (id, msg) {
    return new BizEnum(id, msg);
  }

  static $ (id, msg) {
    return this.of(id, msg);
  }
}

/**
 * @desc 枚举组
 */
export class BizEnumGroup {
  constructor (bizEnums) {
    this.bizEnums = bizEnums;
  }

  /**
   * @desc 获取该枚举所有组合
   */
  values () {
    let values = [];
    for (var k in this.bizEnums) {
      var v = this.bizEnums[k];
      if (BizEnum.is(v)) {
        values.push(v);
      }
    }

    return values;
  }

  /**
   * @desc 获取指定id的枚举对象
   * 
   * @param {int} id 
   */
  valueOf (id) {
    for (var k in this.bizEnums) {
      var v = this.bizEnums[k];
      if (BizEnum.is(v) && v.id === id) {
        return v;
      }
    }

    return null;
  }

  /**
   * @desc 枚举组便携构造函数
   */
  static of(bizEnums) {
    if (Object.freeze)
      Object.freeze(bizEnums);

    return new BizEnumGroup(bizEnums);
  }

  static $ (bizEnums) {
    return this.of(bizEnums);
  }
}