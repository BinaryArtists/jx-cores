/**
 * 事件发送，多对多
 */

function isFunction(fn) {
  return fn instanceof Function;
}

function isObject(obj) {
  return obj instanceof Object;
}

function isArray(arr) {
  return arr instanceof Array;
}

export class Events {
  constructor () {
    this.__eventList = {};
  }

  on (eventName, content) {
    var _event, ctx;
    if (!isFunction(content)) {
      throw new Error('events.prototype.on || [eventName, content] -> Error: "content" must be a function');
    };
    _event = this.__eventList;
    if (!_event) {
      _event = this.__eventList = {};
    } else {
      ctx = this.__eventList[eventName];
    }
    if (!ctx) {
      ctx = this.__eventList[eventName] = content;
      ctx.ListenerCount = 1;
    } else if (isFunction(ctx)) {
      ctx = this.__eventList[eventName] = [ctx, content];
      ctx.ListenerCount = ctx.length;
    } else if (isArray(ctx)) {
      ctx.push(content);
      ctx.ListenerCount = ctx.length;
    }
  }

  emit (eventName, content) {
    var _event, ctx, args = Array.prototype.slice.call(arguments, 1);
    _event = this.__eventList;
    if (_event) {
      ctx = this.__eventList[eventName];
    } else {
      console.warn('events.prototype.emit || [eventName, content] -> Error: "can not find eventName"');
    }
    if (!ctx) {
      return false;
    } else if (isFunction(ctx)) {
      ctx.apply(this, args);
    } else if (isArray(ctx)) {
      for (var i = 0; i < ctx.length; i++) {
        ctx[i].apply(this, args);
      }
    }
    return true;
  }

  once (event, content) {
    if (!isFunction(content)) {
      throw new Error('events.prototype.once || [eventName, content] -> Error: "content" must be a function');
    }
    this.on(event, dealOnce(this, event, content));
    return this;
  }

  off (type, content) {
    var _event, ctx, index = 0;
    if (!isFunction(content)) {
      throw new Error('events.prototype.removeListener || [eventName, content] -> Error: "content" must be a function');
    }
    _event = this.__eventList;
    if (!_event) {
      return this;
    } else {
      ctx = this.__eventList[type];
    }
    if (!ctx) {
      return this;
    }
    if (isFunction(ctx)) {
      if (ctx === content) {
        delete _event[type];
      }
    } else if (isArray(ctx)) {
      for (var i = 0; i < ctx.length; i++) {
        if (ctx[i] === content) {
          this.__eventList[type].splice(i - index, 1);
          ctx.ListenerCount = ctx.length;
          if (this.__eventList[type].length === 0) {
            delete this.__eventList[type]
          }
          index++;
        }
      }
    }
    return this;
  }

  offAll (type) {
    var _event, ctx;
    _event = this.__eventList;
    if (!_event) {
      return this;
    }
    ctx = this.__eventList[type];
    if (arguments.length === 0 && (!type)) {
      var keys = Object.keys(this.__eventList);
      for (var i = 0, key; i < keys.length; i++) {
        key = keys[i];
        delete this.__eventList[key];
      }
    }
    if (ctx || isFunction(ctx) || isArray(ctx)) {
      delete this.__eventList[type];
    } else {
      return this;
    }
  }

  count (type) {
    var _event, ctx, ev_name = type,
      Count_obj = {};
    _event = this.__eventList;
    if (!_event || Object.keys(_event).length === 0) {
      return undefined;
    }
    if (!ev_name) {
      for (var attr in _event) {
        Count_obj[attr] = _event[attr].ListenerCount;
      }
      return Count_obj;
    }
    ctx = this.__eventList[type];
    if (ctx && ctx.ListenerCount) {
      return ctx.ListenerCount;
    } else {
      return 0;
    }
  }

  dealOnce(target, type, content) {
    var fired = false;

    function packageFun() {
      this.removeListener(type, packageFun);
      if (!fired) {
        fired = true;
        content.apply(target, arguments);
      }
      packageFun.content = content;
    }
    return packageFun;
  }

  static install (S, options) {
    S.$ev = new Events(options);
    if (S.prototype) {
      S.prototype.$ev = new Events(options);
    }
  }
 }