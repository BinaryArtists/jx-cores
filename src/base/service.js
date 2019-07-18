// interface ServiceOptions {
//   enableLogging: Boolean;
//   cfgfile: any;
// }

export class Service {
  running = false;
  options = {};

  constructor(options) {
    this.options = options;
  }

  name() {
    return 'default';
  }

  available() {
    return false;
  }

  config(params) {
    for (let prop in params) {
      this[prop] = params[prop];
    }
  }

  static install(S, options) {
    // Not obj.prototype.$service
    S.$service = new Service(options);
  }

  /**
   * @desc 服务依赖
   */
  depends() {
    return [];
  }

  /**
   * @desc 返回promise，表示初始化完成
   */
  ready() {}

  /**
   * @desc 返回signal，表示数据更新
   */
  changed() {}

  /**
   * @desc 服务是否在运行
   */
  isRunning() {
    return this.running;
  }

  /**
   * 服务热启动
   */
  powerOn() {
    this.running = true;
  }

  /**
   * 服务热关闭
   */
  powerOff() {
    this.running = false;
  }
}
