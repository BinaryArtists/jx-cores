function isFunction(fn) {
  return fn instanceof Function;
}

/**
 * 信号发送，一对多
 */
class SignalBinding {
  constructor (signal, listener, isOnce, context, priority) {
    this.active = true;
    this.params = null;

    this._listener = listener;
    this._isOnce = isOnce;
    this.context = context;
    this._signal = signal;
    this._priority = priority || 0;
  }

  execute(paramsArr) {
    var handlerReturn, params;
    if (this.active && !!this._listener) {
      params = this.params? this.params.concat(paramsArr) : paramsArr
      handlerReturn = this._listener.apply(this.context, params)
      if (this._isOnce) {
        this.detach()
      }
    }
    return handlerReturn;
  }

  detach() {
    return this.isBound()? this._signal.off(this._listener, this.context) : null
  }

  /**
   * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
   */
  isBound() {
    return (!!this._signal && !!this._listener)
  }

  /**
   * @return {boolean} If SignalBinding will only be executed once.
   */
  isOnce() {
    return this._isOnce
  }

  /**
   * Delete instance properties
   * @private
   */
  _destroy() {
    delete this._signal
    delete this._listener
    delete this.context
  }
}

export class Signal {
  constructor () {
    this._bindings = []
    this._prevParams = null

    var self = this
    this.dispatch = function () {
      Signal.prototype.dispatch.apply(self, arguments)
    }

    this._shouldPropagate = true // 事件传递

    this.memorize = true // 保留最新信号值
    this.active = true // 功能是否启用
  }

  _validateListener (listener, fnName) {
    if (! isFunction(listener)) {
      throw new Error( 'listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName) )
    }
  }

  _registerListener (listener, isOnce, context, priority) {
    var prevIndex = this._indexOfListener(listener, context), binding;

    if (prevIndex !== -1) {
      binding = this._bindings[prevIndex]
      if (binding.isOnce() !== isOnce) {
        throw new Error('You cannot add'+ (isOnce? '' : 'Once') +'() then add'+ (!isOnce? '' : 'Once') +'() the same listener without removing the relationship first.')
      }
    } else {
      binding = new SignalBinding(this, listener, isOnce, context, priority)
      this._addBinding(binding)
    }

    if (this.memorize && this._prevParams) {
      binding.execute(this._prevParams)
    }

    return binding
  }

  /**
   * @param {SignalBinding} binding
   * @private
   */
  _addBinding  (binding) {
    //simplified insertion sort
    var n = this._bindings.length;
    do { --n; } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority)
    this._bindings.splice(n + 1, 0, binding)
  }

  /**
   * @param {Function} listener
   * @return {number}
   * @private
   */
  _indexOfListener (listener, context) {
    var n = this._bindings.length,
        cur;
    while (n--) {
      cur = this._bindings[n];
      if (cur._listener === listener && cur.context === context) {
        return n;
      }
    }
    return -1
  }

  
  /**
   * Check if listener was attached to Signal.
   */
  has (listener, context) {
    return this._indexOfListener(listener, context) !== -1
  }

  on (listener, context, priority) {
    this._validateListener(listener, 'on')
    return this._registerListener(listener, false, context, priority)
  }

  once (listener, context, priority) {
    this._validateListener(listener, 'once');
    return this._registerListener(listener, true, context, priority);
  }

  off (listener, context) {
    this._validateListener(listener, 'off');

    var i = this._indexOfListener(listener, context);
    if (i !== -1) {
      this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
      this._bindings.splice(i, 1);
    }
    return listener
  }

  offAll () {
    var n = this._bindings.length
    while (n--) {
      this._bindings[n]._destroy()
    }
    this._bindings.length = 0
  }

  // 取消当前事件链传递
  halt () {
    this._shouldPropagate = false;
  }

  send () {
    if (! this.active) {
      return
    }

    var paramsArr = Array.prototype.slice.call(arguments),
      n = this._bindings.length,
      bindings

    if (this.memorize) {
      this._prevParams = paramsArr
    }

    if (! n) {
      //should come after memorize
      return
    }

    bindings = this._bindings.slice()
    this._shouldPropagate = true

    //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
    //reverse loop since listeners with higher priority will be added at the end of the list
    do { n--; } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false)
  }

  forget () {
    this._prevParams = null
  }

  dispose () {
    this.offAll()

    delete this._bindings
    delete this._prevParams

    this.active = false
  }
}