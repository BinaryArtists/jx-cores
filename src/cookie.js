export class CookieProvider {
  constructor () {
    this.doc = document;
  }

  /**
   * @desc 设置cookie
   */
  set (name, value, day) {
    var setting = arguments[0];
    if (Object.prototype.toString.call(setting).slice(8, -1) === 'Object'){
      for (var i in setting) {
        var date = new Date();
        date.setDate(date.getDate() + day);
        this.doc.cookie = i + '=' + setting[i] + ';expires=' + date;
      }
    } else {
      var date = new Date();
      date.setDate(date.getDate() + day);
      this.doc.cookie = name + '=' + value + ';expires=' + date;
    }
  }

  /**
   * @desc 获取cookie
   * @param {*} name 
   */
  get (name) {
    var arr = this.doc.cookie.split('; ');
    for (var i = 0; i < arr.length; i++) {
      var arr2 = arr[i].split('=');
      if (arr2[0] == name) {
        return arr2[1];
      }
    }
    return '';
  }

  /**
   * @desc 删除cookie
   * @param {*} name 
   */
  remove (name) {
    this.set(name, 1, -1);
  }
}