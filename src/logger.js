function merge (o, n) {
  if (!o) o = {};
  for (var p in n) {
    if (n.hasOwnProperty(p))
      o[p] = n[p];
  }

  return o;
}

export class LoggerFormatter {
  constructor (options) {
    const defaultFormatterOptions = {
      output: () => {
        // Must return
      }
    }

    // let { process } = options;
    this.options = options;
  }

  process () {
    
  }
}

// before / after
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

// export class Logger
// dir() 查看对象的所有属性和方法 [x]
// group() groupEnd() 分组打印, 需要连续打印 [x]
export class Logger {
  static defaultOptions = {
    enabledLogging: true, // 打开日志打印
    enabledGroup: true, 
    enabledCache: true, // 打开日志缓存
    cacheRollingNumbers: -1, // 在日志缓存有效时，循环存储数目
  };

  constructor (options) {
    this.__config(options);

    this.formatter = null;
    this.intercepter = null;
  }

  __config (options) {
    let {
      enabledLogging, 
      enabledGroup,
      enabledCache, 
      cacheRollingNumbers, 
    } = options;

    if (enabledCache) {
      this.cache = [];
      if (cacheRollingNumbers) {
        this.cacheMax = cacheRollingNumbers;
      }
    }

    if (enabledLogging) {
      this.delegate = console;
    }
  }

  // MARK: - 设置

  setName (name) {
    this.loggerName = name;
  }

  setFormatter (formatter) {
    this.loggerFormatter = formatter;
  }

  setIntercepter (intercepter) {
    this.loggerIntercepter = intercepter;
  }

  // MARK: - 计时功能
  time (tag) {
    this.delegate && this.delegate.time(tag);
  }
  timeEnd (tag) {
    this.delegate && this.delegate.timeEnd(tag);
  }

  // MARK: - 日志功能

  // ### Render function
  // *Parameters:*
  //
  // * **`data`**: Data to render
  // * **`options`**: Hash with different options to configure the parser
  // * **`indentation`**: Base indentation of the parsed output
  //
  // *Example of options hash:*
  //
  //     {
  //       defaultIndentation: 2     // Indentation on nested objects
  //     }
  // prettyjson.render(app)
  render (data, options, indentation) {
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
            output.push(that.render(element, options, indentation) + ',');
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
          var temp = that.render(data[i], options, indentation);
          output.push(key + temp.trim() + ',');
        }
      });
      removeLastComma(output);
      output.push(line + '},');
    }
    removeLastComma(output);
    // Return all the lines as a string
    return output.join('\n');
  }

  // ### Render from string function
  // *Parameters:*
  //
  // * **`data`**: Data to render as a string
  // * **`options`**: Hash with different options to configure the parser
  // * **`indentation`**: Base indentation of the parsed output
  //
  // *Example of options hash:*
  //
  //     {
  //       defaultIndentation: 2     // Indentation on nested objects
  //     }
  renderString(data, options, indentation) {
    
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
      // Return an error in case of an invalid JSON
      return 'Error:' + ' Not valid JSON!';
    }
    
    // Call the real render() method
    output += this.render(parsedData, options, indentation);
    return output;
  }

  pack (args) /** : {} */ { // 打包日志内容
    var output = this.loggerName? `[${this.loggerName}] ==> ` : '';

    /**  */
    for (var idx in args) {
      var data = args[idx]
      var curType = typeof data;

      output += this.render(data);

      if ('object' === curType) {
        output += '\n' // [] {} 加换行
      } else {
        output += ' ' // 简单类型 加空格
      }
    }

    return output;
  }

  print (method, /** 其他参数 */...theArgs) { // 打印日志
    var args = Array.prototype.slice.apply(theArgs)
    var output = this.pack(args);

    this.delegate && this.delegate[method](output);
  }
  
  log () {
    this.print('debug', ...arguments);
  }

  info () {
    this.print('info', ...arguments);
  }

  warn () {
    this.print('warn', ...arguments);
  }
  
  error () {
    this.print('error', ...arguments);
  }

  dir () {
    this.delegate && this.delegate['dir'](...arguments);
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

  capture (numbers) { // 返回前numbers个日志

  }

  flush () { // 返回所有日志，并清空缓存

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