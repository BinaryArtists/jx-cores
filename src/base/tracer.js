// interface TracerOptions {
//   bizType: string;
//   enableLogging: boolean;
//   chInfo: string;
//   extra: any;
// }

// interface TracerParams {
//   type: string; // 'pv' 页面, 'ck' 点击, 'expo' 曝光, 'sld' 滑动
//   tid: string; // 埋点ID
//   uid: string; // 业务 ID
//   extra: any;
// }

export class Tracer {
  constructor(options) {
    options.bizType = 'tmall.sports';
    options.enableLogging = false;
    options.chInfo = 'universal';
    options.extra = {};
  }

  /**
   * @desc
   * @param param.type 'pv' 页面浏览, 'ck' 点击事件, 'expo' 曝光, 'ev' 通用事件
   * @param param.url 页面route
   * @param param.uid 事件handler/eventname，曝光selector
   */
  // log({ type, url, uid, extra }) {}
  log(data) {
    data.type = 'pv';
    data.tid = 'a.b.c.d';
    data.uid = 'home.banner.1234';
    data.extra = {};
  }

  static install(obj, options) {
    // Not obj.prototype.$service
    obj.$sdk = new Tracer(options);
  }
}
