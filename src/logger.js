var bind = function(scope, func) {
  return function() {
    return func.apply(scope, arguments);
  };
};

function merge (o, n) {
  if (!o) o = {};
  for (var p in n) {
    if (n.hasOwnProperty(p))
      o[p] = n[p];
  }

  return o;
}

var defineLogLevel = function(value, name) {
  return { value: value, name: name };
};

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
const contextualLoggersByNameMap = {};

/**
 * 日志处理器
 */
export class LoggerHandler {
  constructor (options) {
    this.func = options.handle;
  }

  handle (lvl, outputs) {
    this.func(lvl, outputs);
  }
}

/**
 * 日志过滤器
 */
export class LoggerFilter {
  constructor (options) {
    this.func = options.filter;
  }

  filter (lvl, outputs) {
    this.func(lvl, outputs);
  }
}

/**
 * 日志格式化
 */
export class LoggerFormatter {
  constructor (options) {
    this.func = options.format;
  }

  format (lvl, outputs) {
    return this.func(lvl, outputs);
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
  static TRACE = defineLogLevel(1, 'trace');
  static DEBUG = defineLogLevel(2, 'debug');
  static INFO = defineLogLevel(3, 'info');
  static TIME = defineLogLevel(4, 'time');
  static WARN = defineLogLevel(5, 'warn');
  static ERROR = defineLogLevel(9, 'error');
  static OFF = defineLogLevel(99, 'off');

  static defaultOptions = {
    enabledLogging: true, // 打开日志打印
    enabledGroup: true,  // 打开分组打印，该选项生效
    enabledCache: true, // 打开日志缓存
    cacheRollingNumbers: -1, // 在日志缓存有效时，循环存储数目
    filterLevel: Logger.TRACE,
    name: null
  };

  constructor (options) {
    this.__config(options || {});
  }

  __config (options) {
    let {
      enabledLogging, 
      enabledGroup,
      enabledCache, 
      cacheRollingNumbers,
      filterLevel,
      name,
    } = options;

    this.enabledCache = enabledCache;
    if (this.enabledCache) {
      loggerDogger.setCacheRollingNumbers(cacheRollingNumbers);
    }

    if (enabledLogging) {
      this.delegate = console;
    }

    this.loggerFilterLevel = filterLevel;
    this.loggerName = name
  }

  __enabledFor (lvl) {
    var filterLevel = this.loggerFilterLevel;
    return lvl.value >= filterLevel.value;
  }

  // MARK: - 设置

  setLevel (lvl) {
    this.loggerFilterLevel = lvl;
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

  time (label) {
    if (!this.__enabledFor(Logger.TIME)) return;

    if (typeof label === 'string' && label.length > 0)
      this.delegate && this.delegate.time(label);
  }
  timeEnd (label) {
    if (!this.__enabledFor(Logger.TIME)) return;

    if (typeof label === 'string' && label.length > 0)
      this.delegate && this.delegate.timeEnd(label);
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
        if (lastElement)
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
    var outputs = [];

    /**  */
    for (var idx in args) {
      var data = args[idx]
      var curType = typeof data;

      if ('string' === curType) {
        outputs.push(this.__renderString(data));
      } else if ('object' === curType || 'array' === curType) {
        outputs.push(this.__render(data)+'\n');
      } else {
        outputs.push(data)
      }

      // if ('object' === curType) {
      //   outputs.push('\n'); // [] {} 加换行
      // } else {
      //   // outputs.push(' '); // 简单类型 加空格
      // }
    }

    return outputs;
  }

  __packLoggerLabel (outputs) {
    if (!this.loggerName) return outputs;

    let loggerLabel = `[${this.loggerName}] ==> `;

    if (outputs.length === 0) {
      
      outputs.unshift(loggerLabel)
    } else if (outputs.length > 0 && typeof outputs[0] === 'string') {
      // 合并 outputs[0] & label
      outputs[0] = loggerLabel + outputs[0]
    }

    return outputs;
  }

  __print (lvl, /** 其他参数 */...theArgs) { // 打印日志
    // console.info(lvl, theArgs);

    if (!this.__enabledFor(lvl)) return;

    var args = Array.prototype.slice.apply(theArgs)
    var outputs = this.__pack(args);

    // 日志过滤器
    let pass = false;
    this.loggerFilter && (pass = this.loggerFilter.filter(lvl, outputs));
    if (pass) return;

    // 日志格式化
    this.loggerFormatter && (outputs = this.loggerFormatter.format(lvl, outputs))

    // 日志打标签
    outputs = this.__packLoggerLabel(outputs)

    // 日志输出
    this.delegate && this.delegate[lvl.name](...outputs);

    // 日志处理器
    this.loggerHandler && this.loggerHandler.handle(lvl, outputs);
    
    // 日志入缓存
    this.enabledCache && loggerDogger.add(lvl, outputs);
  }

  trace () {
    this.__print(Logger.TRACE, ...arguments);
  }
  
  log () {
    this.__print(Logger.DEBUG, ...arguments);
  }

  info () {
    this.__print(Logger.INFO, ...arguments);
  }

  warn () {
    this.__print(Logger.WARN, ...arguments);
  }
  
  error () {
    this.__print(Logger.ERROR, ...arguments);
  }

  dir () {
    this.delegate && this.delegate['dir'](...arguments);
  }

  // print () {
  //   this.delegate && this.delegate(Logger.ERROR, ...arguments);
  // }

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

  // MARK: - 静态方法

  static help () {
    var logger = Logger.getLogger("")
    logger.log({
      "获取日志对象": 'Logger.getLogger(\'测试\')',
      "测试时间": [
        'logger.time(\'aaa\');',
        'logger.timeEnd(\'aaa\');'
      ],
      '表格打印': 'logger.table([{a:1},{b:1}]);',
      '图片打印': 'logger.image("http://pic16.nipic.com/20110926/6333052_165902361105_2.jpg")',
      '日志打印': [
        'logger.log(\', d\', \', a\', \', b\');',
        'logger.info(\', d\', \', a\', \', b\');',
        'logger.warn(\', d\', \', a\', \', b\');',
        'logger.error(\', d\', \', a\', \', b\');' 
      ],
      '日志导出': [
        'var logs = logger.flush(2);',
        'console.log(logs);'
      ],
      '日志过滤': [
        'logger.setFilter(new LoggerFilter({',
        '  filter: (lvl, outputs) => {',
        '    if (lvl === Logger.Level.WARN) return true;',
        '    return false;',
        '  }',
        '}));'
      ],
      '日志处理': [
        'logger.setHandler(new LoggerHandler({',
        '  handle: (lvl)=> {',
        '    console.log(`收到日志： ${lvl}`)',
        '  }',
        '}));'
      ],
      '日志格式化': [
        'logger.setFormatter(new LoggerFormatter({',
        '  format: (lvl, outputs) => {',
        '    return `已达标, ${outputs}`;',
        '  }',
        '}))'
      ],
      "格式化输出(不支持object)": [
        "%s, 字符串",
        "%d/%i, 整数",
        "%f, 浮点数",
        "%o/%O, Object对象",
        "%c, css样式"
      ],
    })
  }

  static setLevel (lvl) {
    for (var key in contextualLoggersByNameMap) {
			if (contextualLoggersByNameMap.hasOwnProperty(key)) {
				contextualLoggersByNameMap[key].setLevel(lvl);
			}
		}
  }

  static getLogger (name, options) {
    options = options || {};
    options.name = name;

    if (options) {
      this.defaultOptions = merge(this.defaultOptions, options);
    }

    let logger = contextualLoggersByNameMap[name] || (contextualLoggersByNameMap[name] = new Logger(merge(this.defaultOptions, options)));

    return logger;
  }

  static install (S, options) {
    S.$logger = this.getLogger('default', options);
    if (S.prototype) {
      S.prototype.$logger = this.getLogger('default', options);
    }
  }
}


export class LoggerFactory {
  getLogger (name, options) {
    return Logger.getLogger(name, options);
  }

  /**
   * 理论上它可以全局控制选项，直接调用Logger.getLogger(name, options)应该是局部控制
   */
  static install (S, options) {
    S.$loggerFactory = new LoggerFactory();
    if (S.prototype) {
      S.prototype.$loggerFactory = S.$loggerFactory;
    }
  }
}