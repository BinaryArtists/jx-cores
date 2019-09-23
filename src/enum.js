import { Assert } from './assert';

/**
 * 枚举
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
    // Assert.number(id, 'BizEnum.id 必须为 number');
    Assert.string(msg, 'BizEnum.msg 必须为 string');

    if (Object.freeze)
      Object.freeze(this);
  }

  /**
   * 枚举等价
   * 
   * @param {number, string} id 
   */
  equal (idOrMsg) {
    return this.id == idOrMsg;
  }

  /**
   * 鸭子类型 长得像/叫的像，那就是了。
   */
  static is (bizEnumOrNot) {
    return bizEnumOrNot.id != undefined && bizEnumOrNot.msg != undefined;
  }
  
  /**
   * 枚举便携构造
   * 
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
 * 枚举组
 */
export class BizEnumGroup {
  constructor (bizEnums) {
    this.bizEnums = bizEnums;
  }

  /**
   * 获取该枚举所有组合
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
   * 获取指定id的枚举对象
   * 
   * @param {int} id 
   */
  valueOf (id) {
    for (var k in this.bizEnums) {
      var v = this.bizEnums[k];
      if (BizEnum.is(v) && v.id == id) {
        return v;
      }
    }

    return null;
  }

  /**
   * 枚举组便携构造函数
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