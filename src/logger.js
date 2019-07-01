function merge (o, n) {
  if (!o) o = {};
  for (var p in n) {
    if (n.hasOwnProperty(p))
      o[p] = n[p];
  }

  return o;
}

function getBox(width, height) {
  return {
    string: "+",
    style: "font-size: 1px; padding: " + Math.floor(0) + "px " + Math.floor(width/2) + "px; line-height: " + height + "px;"
  }
}

/**
 * 日志看门狗
 * 
 * 1. 全局日志缓存
 * 2. 全局日志行为记录
 */
class __Log {
  constructor (lvl, content) {
    this.lvl = lvl;
    this.content = content;
  }
}
class __LoggerDogger {
  constructor () {
    this.logs = [];
  }

  setCacheRollingNumbers (numbers) {
    this.cacheRollingNumbers = numbers;
  }

  add (lvl, content) {
    this.logs.push(new __Log(lvl, content));
  }

  flush (numbers, lvl) {
    let outputs = [];

    for (var idx in this.logs) {
      let log = this.logs[idx];
      if (lvl) {
        if (lvl === log.lvl) {
          outputs.push(log.content);
        }
      } else {
        outputs.push(log.content);
      }
    }

    this.logs = [];

    if (numbers) {
      return outputs.slice(0, numbers);
    } else {
      return outputs;
    }
  }
}

const loggerDogger = new __LoggerDogger();

/**
 * 日志处理器
 */
export class LoggerHandler {
  constructor (options) {
    this.func = options.handle;
  }

  handle (lvl, content) {
    this.func(lvl, content);
  }
}

/**
 * 日志过滤器
 */
export class LoggerFilter {
  constructor (options) {
    this.func = options.filter;
  }

  filter (lvl, content) {
    this.func(lvl, content);
  }
}

/**
 * 日志格式化
 */
export class LoggerFormatter {
  constructor (options) {
    this.func = options.format;
  }

  format (lvl, content) {
    return this.func(lvl, content);
  }
}

/**
 * 日志拦截器
 */
export class LoggerIntercepter {
  constructor (options) {
    const defaultInterceptorOptions = {
      before: () => {
        // No return
      },
      after: () => {
        // No return
      }
    }
  }

  before () {

  }

  after () {

  }
}

/**
 * 日志
 */
// export class Logger
// dir() 查看对象的所有属性和方法 [x]
// group() groupEnd() 分组打印, 需要连续打印 [x]
export class Logger {
  static Level = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  }
  static defaultOptions = {
    enabledLogging: true, // 打开日志打印
    enabledGroup: true,  // 打开分组打印，该选项生效
    enabledCache: true, // 打开日志缓存
    cacheRollingNumbers: -1, // 在日志缓存有效时，循环存储数目
  };

  constructor (options) {
    this.__config(options);
  }

  __config (options) {
    let {
      enabledLogging, 
      enabledGroup,
      enabledCache, 
      cacheRollingNumbers, 
    } = options;

    this.enabledCache = enabledCache;
    if (this.enabledCache) {
      loggerDogger.setCacheRollingNumbers(cacheRollingNumbers);
    }

    if (enabledLogging) {
      this.delegate = console;
    }
  }

  // MARK: - 设置

  setName (name) {
    this.loggerName = name;
  }

  setHandler (handler) {
    this.loggerHandler = handler;
  }

  setFilter (filter) {
    this.loggerFilter = filter;
  }

  setFormatter (formatter) {
    this.loggerFormatter = formatter;
  }

  // MARK: - 计时功能
  time (tag) {
    this.delegate && this.delegate.time(tag);
  }
  timeEnd (tag) {
    this.delegate && this.delegate.timeEnd(tag);
  }

  // MARK: - 日志功能

  /**
   * 渲染对象
   * 
   * @param {*} data Data to render
   * @param { defaultIndentation } options Hash with different options to configure the parser
   * @param {*} indentation Base indentation of the parsed output
   */
  __render (data, options, indentation) {
    // Default values
    indentation = indentation || 0;
    options = options || {};
    options.defaultIndentation = options.defaultIndentation || 2;
    
    var output = [];
    
    // Helper function to detect if an object can be directly serializable
    var isSerializable = function(input, onlyPrimitives) {
      if (typeof input === 'boolean' ||
          typeof input === 'number' || input === null) {
        return true;
      }
      if (typeof input === 'string' && input.indexOf('\n') === -1) {
        return true;
      }
    
      return false;
    };
    
    var indentLines = function(string, spaces){
      var lines = string.split('\n');
      lines = lines.map(function(line){
        return indent(spaces) + line;
      });
      return lines.join('\n');
    };
    
    var outputData = function(input) {
    
      if (typeof input === 'string') {
        // Print strings wraped by double quote
        return '"' + input + '"';
      }
    
      if (input === true) {
        return 'true';
      }
      if (input === false) {
        return 'false';
      }
      if (input === null) {
        return 'null';
      }
      if (typeof input === 'number') {
        return input;
      }
    
      return input;
    };
    var removeLastComma = function(output) {
        var lastElement = output[output.length-1];
        output[output.length-1] = lastElement.substr(0, lastElement.length-1);
    };
    var indent = function(numSpaces) {
      return new Array(numSpaces+1).join(' ');
    };
    // Render a string exactly equal
    if (isSerializable(data)) {
      output.push(indent(indentation) + outputData(data));
    }
    else if (typeof data === 'string') {
      var lines = data.split('\n');
      lines.map(function(line){
        return indent(indentation + options.defaultIndentation) + '"' + line + '"';
      });
      output.push(lines.join(',\n'));
    }
    else if (Array.isArray(data)) {
      var line = indent(indentation);
      indentation = indentation + options.defaultIndentation;
      output.push(line + '[');
      // If the array is empty
      if (data.length === 0) {
        output.push(indent(indentation) +' ');
      } else {
        var that = this;
        data.forEach(function(element) {
          if(isSerializable(element)) {
            output.push(indent(indentation) + outputData(element) + ',');
          } else {
            output.push(that.__render(element, options, indentation) + ',');
          }
        });
        removeLastComma(output);
      }
      output.push(line + '],');
    }
    else if (typeof data === 'object') {
      var line = indent(indentation);
      output.push(line+'{');
      var key;
      var isError = data instanceof Error;
      indentation = indentation + options.defaultIndentation;
      
      var that = this;
      Object.getOwnPropertyNames(data).forEach(function(i) {
        // Prepend the index at the beginning of the line
        key = ('"' + i +'"'+ ': ');
        key = indent(indentation) + key;
    
        // Skip `undefined`, it's not a valid JSON value.
        if (data[i] === undefined) {
          return;
        }
        if(isSerializable(data[i])) {
          output.push(key + outputData(data[i]) + ',');
        }else {
          var temp = that.__render(data[i], options, indentation);
          output.push(key + temp.trim() + ',');
        }
      });
      removeLastComma(output);
      output.push(line + '},');
    } else if (data === undefined) {
      output.push(`${indent(indentation)}${data}\n`)
    }
    removeLastComma(output);
    // Return all the lines as a string
    return output.join('\n');
  }

  /**
   * 结构化渲染字符串
   * 
   * @param {*} data 
   * @param {*} options 
   * @param {*} indentation 
   */
  __renderString(data, options, indentation) {
    var originalData = data;
    var output = '';
    var parsedData;
    // If the input is not a string or if it's empty, just return an empty string
    if (typeof data !== 'string' || data === '') {
      return '';
    }
    
    // Remove non-JSON characters from the beginning string
    if (data[0] !== '{' && data[0] !== '[') {
      var beginingOfJson;
      if (data.indexOf('{') === -1) {
        beginingOfJson = data.indexOf('[');
      } else if (data.indexOf('[') === -1) {
        beginingOfJson = data.indexOf('{');
      } else if (data.indexOf('{') < data.indexOf('[')) {
        beginingOfJson = data.indexOf('{');
      } else {
        beginingOfJson = data.indexOf('[');
      }
      output += data.substr(0, beginingOfJson) + '\n';
      data = data.substr(beginingOfJson);
    }
    
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      // Return orginal string
      return originalData;
    }
    
    // Call the real render() method
    output += this.__render(parsedData, options, indentation);
    return output;
  }

  __pack (args) /** : {} */ { // 打包日志内容
    var output = this.loggerName? `[${this.loggerName}] ==> ` : '';

    /**  */
    for (var idx in args) {
      var data = args[idx]
      var curType = typeof data;

      if ('string' === curType) {
        output += this.__renderString(data);
      } else {
        output += this.__render(data);
      }

      if ('object' === curType) {
        output += '\n' // [] {} 加换行
      } else {
        output += ' ' // 简单类型 加空格
      }
    }

    return output;
  }

  __print (method, /** 其他参数 */...theArgs) { // 打印日志
    var args = Array.prototype.slice.apply(theArgs)
    var output = this.__pack(args);

    // 日志过滤器
    let pass = false;
    this.loggerFilter && (pass = this.loggerFilter.filter(method, output));
    if (pass) return;

    // 日志格式化
    this.loggerFormatter && (output = this.loggerFormatter.format(method, output))

    // 日志输出
    this.delegate && this.delegate[method](output);

    // 日志处理器
    this.loggerHandler && this.loggerHandler.handle(method, output);
    
    // 日志入缓存
    this.enabledCache && loggerDogger.add(method, output);
  }
  
  log () {
    this.__print('debug', ...arguments);
  }

  info () {
    this.__print('info', ...arguments);
  }

  warn () {
    this.__print('warn', ...arguments);
  }
  
  error () {
    this.__print('error', ...arguments);
  }

  dir () {
    this.delegate && this.delegate['dir'](...arguments);
  }

  print () {
    this.delegate && this.delegate('debug', ...arguments);
  }

  // 图片打印
  // bug: 打印出了两张图

  image (url, scale) {
    scale = scale || 0.2;
		var img = new Image();

    let that = this;
		img.onload = function() {
      
      var width = this.width * scale;
      var height = this.height * scale;
      var dim = getBox(width, height);
      // that.delegate && that.delegate['log']("%c" + dim.string, dim.style + "background: url(" + url + "); background-size: " + (this.width * scale) + "px " + (this.height * scale) + "px; color: transparent;");
      console.log("%c" + dim.string, dim.style + "background: url(" + url + "); background-size: " + (width) + "px " + (height) + "px; color: transparent; background-repeat: no-repeat;"
      + `max-width: ${width}; max-height: ${height};`);
		};
		img.src = url;
  }

  // 分组打印
  group (tag) {
    this.delegate && this.delegate.group(tag);
  }

  groupEnd () {
    this.delegate && this.delegate.groupEnd(tag);
  }

  // MARK: - 表格展示

  table () {
    this.delegate && this.delegate.table(arguments)
  }

  // MAKR: - 日志拦截器



  // MARK: - 日志缓存输出

  flush (numbers, lvl) { // 返回所有日志，并清空缓存
    return loggerDogger.flush(numbers, lvl);
  }

  // MARK: - 性能分析

  profile (tag) {
    this.delegate && this.delegate.profile(tag);
  }

  profileEnd (tag) {
    this.delegate && this.delegate.profileEnd(tag);
  }

  count () {
    this.delegate && this.delegate.count();
  }

  // 模块帮助

  help () {
    this.log({
      1: {
        title: "格式化输出",
        content: [
          "%s, 字符串",
          "%d/%i, 整数",
          "%f, 浮点数",
          "%o/%O, Object对象",
          "%c, css样式"
        ]
      },
      2: {

      },
      3: {

      },
      4: {

      },
      5: {

      }
    })
  }

  // MARK: - 静态方法

  static getLogger (name) {
    let logger = new Logger(this.defaultOptions);
    logger.setName(name);

    return logger;
  }

  static install (S, options) {
    if (options) {
      this.defaultOptions = merge(this.defaultOptions, options);
    }

    S.$logger = new Logger(options);
    if (S.prototype) {
      S.prototype.$logger = new Logger(options);
    }
  }
}