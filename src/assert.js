/// Util Function

function toString(value) {
  if (typeof value === 'string') return `string["${value}"]`;
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return `int[${value}]`;
    return `float[${value}]`;
  }
  if (typeof value === 'boolean') return `boolean[${(value) ? "true" : "false"}]`;
  if (typeof value === 'function') return `function[${value.toString()}]`;
  if (typeof value === 'object') {
    if (Array.isArray(value)) return `array[length: ${value.length}]`;
    if (value instanceof Map) return `Map[size: ${value.size}]`;
    if (value instanceof WeakMap) return `WeakMap[]`;
    if (value instanceof Set) return `Set[size: ${value.size}]`;
    if (value instanceof WeakSet) return `WeakSet[]`;
    if (value instanceof String) return `String["${value}"]`;
    if (value instanceof Number) {
      let source = value.valueOf();
      if (Number.isInteger(source)) return `Number:int[${source}]`;
      return `Number:float[${source}]`;
    }
    if (value instanceof Boolean) return `Boolean[${(value.valueOf()) ? "true" : "false"}]`;
    if (value instanceof Date) return `Date["${value.toUTCString()}"]`;
    if (value instanceof RegExp) return `RegExp[${value.toString()}]`;
    return `object[${JSON.stringify(value)}]`;
  }
  if (typeof value === 'undefined') return 'undefined';
  throw `Unhandled type ${typeof value}`;
}

function createMessage(template, data = {}) {
  if (typeof template !== 'string') {
    throw new Error(`Expected string but got "${toString(template)}".`);
  }

  if (typeof data !== 'object') {
    throw new Error(`Expected string but got "${toString(data)}".`);
  }

  return template.replace(/\${(.*?)}/g, function(placeholder, propertyName) {
    if (data.hasOwnProperty(propertyName)) {
      return data[propertyName];
    }

    return placeholder;
  });
}

function expected(type, value, message = "") {
  if (typeof message !== 'string') {
    throw new Error(`Expected string but got "${toString(message)}".`);
  }

  if (message.length) {
    return new Error(createMessage(message, {expected: type, received: toString(value)}));
  }

  return new Error(`Expected ${type} but got "${toString(value)}".`);
}

/// 断言

export class Assert {
  static instanceOf(objectValue, expectedInstance, message = "") {
    this.string(message, "Custom error message passed to Assert.instanceOf needs to be a valid string.");

    if (typeof objectValue !== 'object') {
      throw expected("object", objectValue, message);
    }

    if (!(objectValue instanceof expectedInstance)) {
      throw expected( expectedInstance.name, objectValue,
        message.length ? message : "Expected instance of \"${expected}\" but got \"${received}\"."
      );
    }
  }

  static instanceOneOf(objectValue, expectedInstances, message = "") {
    this.string(message, "Custom error message passed to Assert.instanceOf needs to be a valid string.");
    this.array(expectedInstances);

    let instance = expectedInstances.find((expectedInstance) => {
      return (objectValue instanceof expectedInstance)
    });

    if (instance === undefined) {
      throw expected(
        expectedInstances.map((instance) => {return toString(instance); }).join(', '),
        objectValue,
        message.length ? message : "Expected instance of \"${expected}\" but got \"${received}\"."
      );
    }
  }

  static integer(integerValue, message = "") {
    this.string(message, "Custom error message passed to Assert.integer needs to be a valid string.");

    if (!Number.isInteger(integerValue)) {
      throw expected("integer", integerValue, message);
    }
  }

  static number(numberValue, message = "") {
    this.string(message, "Custom error message passed to Assert.number needs to be a valid string.");

    if (typeof numberValue !== 'number') {
      throw expected("number", numberValue, message);
    }
  }

  static string(stringValue, message = "") {
    if (typeof message !== "string") {
      throw new Error("Custom error message passed to Assert.string needs to be a valid string.");
    }

    if (typeof stringValue !== "string") {
      throw expected("string", stringValue, message);
    }
  }

  static boolean(booleanValue, message = "") {
    this.string(message, "Custom error message passed to Assert.boolean needs to be a valid string.");

    if (typeof booleanValue !== 'boolean') {
      throw expected("boolean", booleanValue, message);
    }
  }

  static true(value, message = "") {
    this.boolean(value);
    this.string(message, "Custom error message passed to Assert.true needs to be a valid string.");

    if (value !== true) {
      throw expected("true", value, message);
    }
  }

  static false(value, message = "") {
    this.boolean(value);
    this.string(message, "Custom error message passed to Assert.false needs to be a valid string.");

    if (value !== false) {
      throw expected("false", value, message);
    }
  }

  static equal(value, expectedValue, message = "") {
    if (typeof value !== 'object') {
      this.true(value === expectedValue, message ? message : `Expected value ${toString(value)} to be equals ${toString(expectedValue)} but it's not.`);
    } else {
      this.objectEqual(value, expectedValue, message ? message : `Expected value ${toString(value)} to be equals ${toString(expectedValue)} but it's not.`);
    }
  }

  static objectEqual(object, expectedObject, message = "") {
    this.object(object, message);
    this.object(expectedObject, message);

    let objectProperties = Object.getOwnPropertyNames(object);
    let expectedObjectProperties = Object.getOwnPropertyNames(expectedObject);

    this.true(objectProperties.length === expectedObjectProperties.length, message ? message : `Expected object ${toString(object)} to be equals ${toString(expectedObject)} but it's not.`);

    objectProperties.forEach((objectProperty) => {
      this.equal(object[objectProperty], expectedObject[objectProperty], message ? message : `Expected object ${toString(object)} to be equals ${toString(expectedObject)} but it's not.`);
    });
  }

  static object(objectValue, message = "") {
    this.string(message, "Custom error message passed to Assert.object needs to be a valid string.");

    if (typeof objectValue !== 'object') {
      throw expected("object", objectValue, message);
    }
  }

  static hasFunction(expectedFunctionName, objectValue, message = "") {
    this.string(expectedFunctionName);
    this.object(objectValue);
    this.string(message, "Custom error message passed to Assert.hasFunction needs to be a valid string.");

    if (typeof objectValue[expectedFunctionName] !== 'function') {
      throw expected(`object to has function "${expectedFunctionName}"`, objectValue, message);
    }
  }

  static hasProperty(expectedPropertyName, objectValue, message = "") {
    this.string(expectedPropertyName);
    this.object(objectValue);
    this.string(message, "Custom error message passed to Assert.hasProperty needs to be a valid string.");

    if (typeof objectValue[expectedPropertyName] === 'undefined') {
      throw expected(`object to has property "${expectedPropertyName}"`, objectValue, message);
    }
  }

  static hasProperties(expectedProperties, objectValue, message = "") {
    this.object(objectValue);
    this.containsOnlyString(expectedProperties);
    this.string(message, "Custom error message passed to Assert.hasProperties needs to be a valid string.");

    expectedProperties.map((expectedProperty) => {
      if (typeof objectValue[expectedProperty] === 'undefined') {
        throw expected(`object to has properties "${expectedProperties.join(', ')}"`, objectValue, message);
      }
    });
  }

  static array(arrayValue, message = "") {
    this.string(message, "Custom error message passed to Assert.array needs to be a valid string.");

    if (!Array.isArray(arrayValue)) {
      throw expected("array", arrayValue, message);
    }
  }

  static oneOf(value, expectedElements, message = "") {
    this.string(message, "Custom error message passed to Assert.array needs to be a valid string.");
    this.array(expectedElements);

    let foundValue = expectedElements.find((expectedInstance) => {
      return value === expectedInstance;
    });

    if (foundValue === undefined) {
      throw expected(
      expectedElements.map((elemenet) => {return toString(elemenet); }).join(', '),
      value,
      message.length ? message : "Expected one of \"${expected}\" but got \"${received}\"."
      );
    }
  }

  static function(functionValue, message = "") {
    this.string(message, "Custom error message passed to Assert.isFunction needs to be a valid string.");

    if (typeof functionValue !== 'function') {
      throw expected("function", functionValue, message);
    }
  }

  static greaterThan(expected, integerValue, message = "") {
    this.number(expected);
    this.number(integerValue);
    this.string(message, "Custom error message passed to Assert.greaterThan needs to be a valid string.");

    if (integerValue <= expected) {
      throw new Error(message.length > 0 ? message : `Expected value ${integerValue} to be greater than ${expected}`);
    }
  }

  static greaterThanOrEqual(expected, integerValue, message = "") {
    this.number(expected);
    this.number(integerValue);
    this.string(message, "Custom error message passed to Assert.greaterThanOrEqual needs to be a valid string.");

    if (integerValue < expected) {
      throw new Error(message.length > 0 ? message : `Expected value ${integerValue} to be greater than ${expected} or equal`);
    }
  }

  static lessThan(expected, integerValue, message = "") {
    this.number(expected);
    this.number(integerValue);
    this.string(message, "Custom error message passed to Assert.lessThan needs to be a valid string.");

    if (integerValue >= expected) {
      throw new Error(message.length > 0 ? message : `Expected value ${integerValue} to be less than ${expected}`);
    }
  }

  static lessThanOrEqual(expected, integerValue, message = "") {
    this.number(expected);
    this.number(integerValue);
    this.string(message, "Custom error message passed to Assert.lessThanOrEqual needs to be a valid string.");

    if (integerValue > expected) {
      throw new Error(message.length > 0 ? message : `Expected value ${integerValue} to be less than ${expected} or equal`);
    }
  }

  static containsOnly(arrayValue, expectedInstance, message = "") {
    this.array(arrayValue, "Assert.containsOnly require valid array, got \"${received}\".");
    this.string(message, "Custom error message passed to Assert.containsOnly needs to be a valid string.");

    for (let element of arrayValue) {
      try {
        this.instanceOf(element, expectedInstance, message);
      } catch (error) {
        throw expected(
          expectedInstance.name,
          element,
          message.length ? message : "Expected instance of \"${expected}\" but got \"${received}\"."
        );
      }
    }
  }

  static containsOnlyString(arrayValue, message = "") {
    this.array(arrayValue, "Assert.containsOnlyString require valid array, got \"${received}\".");
    this.string(message, "Custom error message passed to Assert.containsOnly needs to be a valid string.");

    for (let element of arrayValue) {
      try {
        this.string(element, message);
      } catch (error) {
        throw expected( 'string', arrayValue.map((value) => { return toString(value); }).join(', '),
          message.length ? message : "Expected array of \"${expected}\" but got \"${received}\"."
        );
      }
    }
  }

  static containsOnlyInteger(arrayValue, message = "") {
    this.array(arrayValue, "Assert.containsOnlyInteger require valid array, got \"${received}\".");
    this.string(message, "Custom error message passed to Assert.containsOnly needs to be a valid string.");

    for (let element of arrayValue) {
      try {
        this.integer(element, message);
      } catch (error) {
        throw expected( 'integer', arrayValue.map((value) => { return toString(value); }).join(', '),
          message.length ? message : "Expected array of \"${expected}\" but got \"${received}\"."
        );
      }
    }
  }

  static containsOnlyNumber(arrayValue, message = "") {
    this.array(arrayValue, "Assert.containsOnlyNumber require valid array, got \"${received}\".");
    this.string(message, "Custom error message passed to Assert.containsOnly needs to be a valid string.");

    for (let element of arrayValue) {
      try {
        this.number(element, message);
      } catch (error) {
        throw sexpected(
          'number',
          arrayValue.map((value) => { return toString(value); }).join(', '),
          message.length ? message : "Expected array of \"${expected}\" but got \"${received}\"."
        );
      }
    }
  }

  static count(expectedCount, arrayValue, message = "") {
    this.integer(expectedCount);
    this.array(arrayValue);
    this.string(message, "Custom error message passed to Assert.count needs to be a valid string.");

    if (arrayValue.length !== expectedCount) {
      throw new Error(message.length ? message : `Expected count ${expectedCount}, got ${arrayValue.length}`);
    }
  }

  static notEmpty(value, message = "") {
    this.string(message, "Custom error message passed to Assert.empty needs to be a valid string.");

    if (value.length === 0) {
      throw expected("not empty value", value, message);
    }
  }

  static oddNumber(integerValue, message = "") {
    this.integer(integerValue);
    this.string(message, "Custom error message passed to Assert.oddNumber needs to be a valid string.");

    if ((integerValue % 2) !== 1) {
      throw expected("odd number", integerValue, message);
    }
  }

  static evenNumber(integerValue, message = "") {
    this.integer(integerValue);
    this.string(message, "Custom error message passed to Assert.evenNumber needs to be a valid string.");

    if ((integerValue % 2) !== 0) {
      throw expected("even number", integerValue, message);
    }
  }

  static jsonString(stringValue, message = "") {
    this.string(stringValue);
    this.string(message, "Custom error message passed to Assert.jsonString needs to be a valid string.");

    try {
      JSON.parse(stringValue);
    } catch (e) {
      throw expected("json string", stringValue, message);
    }
  }

  static email(emailValue, message = "") {
    this.string(emailValue);
    this.string(message, "Custom error message passed to Assert.email needs to be a valid string.");

    let regexp = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

    if (!regexp.test(emailValue)) {
      throw expected("valid email address", emailValue, message);
    }
  }

  static url(urlValue, message = "") {
    this.string(urlValue);
    this.string(message, "Custom error message passed to Assert.url needs to be a valid string.");

    let regexp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

    if (!regexp.test(urlValue)) {
      throw expected("valid url", urlValue, message);
    }
  }

  static uuid(uuidValue, message = "") {
    this.string(uuidValue);
    this.string(message, "Custom error message passed to Assert.uuid needs to be a valid string.");

    let regexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!regexp.test(uuidValue)) {
      throw expected("valid uuid", uuidValue, message);
    }
  }

  static hasElement(selector, htmlElement, message = "") {
    this.string(selector);
    this.instanceOneOf(htmlElement, [HTMLElement, HTMLDocument]);
    this.string(message, "Custom error message passed to Assert.hasProperty needs to be a valid string.");

    if (null === htmlElement.querySelector(selector)) {
      throw expected(`html element to has element under selector "${selector}"`, htmlElement.outerHTML, message);
    }
  }

  static hasAttribute(attributeName, htmlElement, message = "") {
    this.string(attributeName);
    this.instanceOf(htmlElement, HTMLElement);
    this.string(message, "Custom error message passed to Assert.hasAttribute needs to be a valid string.");

    let attribute = htmlElement.getAttribute(attributeName);

    if (null ===  attribute) {
      throw expected(`html element with attribute "${attributeName}"`, htmlElement.outerHTML, message);
    }
  }
}