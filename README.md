* 无前缀：public
* _ 开头：protected
* __ 开头：private

TODO
---

- [] ts注解，支持function log打印，property log打印等


断言
---

```
import {Assert} from 'jx-cores';

Assert.instanceOf(inst, expectedInst, msg);
Assert.instanceOneOf(inst, expectedInsts, msg);

Assert.oneOf(value, expectedValues, msg);

Assert.equal(inst, expectedInst, msg);
Assert.objectEqual(inst, expectedInst, msg);

Assert.hasFunction(valueName, inst, msg);
Assert.hasProperty(valueName, inst, msg);
Assert.hasProperties(valueNames, inst, msg);

Assert.greaterThan(expected, value, msg);
Assert.greaterThanOrEqual(expected, value, msg);
Assert.lessThan(expected, value, msg);
Assert.lessThanOrEqual(expected, value, msg);

Assert.integer(value, msg);
Assert.number(value, msg);
Assert.string(value, msg);
Assert.boolean(value, msg);
Assert.true(value, msg);
Assert.false(value, msg);
Assert.object(value, msg);
Assert.array(value, msg);
Assert.function(value, msg);
```

降维 Promise.then().catch() => [err, res]
---

*告别回调函数*

```
async function asyncFunctionWithThrow() {
  const [err, user] = await to(UserModel.findById(1));

  if (!user) throw new Error('User not found');
 }
```

Cookie
---

小程序不可用

枚举
---

* 也推荐：[adrai/enum](https://github.com/adrai/enum)

```
import {BizEnum, BizEnumGroug} from 'jx-cores';

const SexEnum = {
  MALE: BizEnum.$(0, '男'),
  FEMALE: BizEnum.$(1, '女')
};
const SexEnumGroup = BizEnumGroug.$(SexEnum);

var type = res.type;
var sex = SexEnumGroup.valueOf(type);

if (sex) {
  console.log('sex = ', sex.msg);

  if (SexEnum.MALE.equal(type)) {
    // 处理男性情况
  } else if (SexEnum.FEMALE.equal(type)) {
    // 处理女性情况
  }
}
```

错误
---

```
import {BizError} from 'jx-cores';

var error1 = new BizError(); // { err: -3.14, msg: "未定义错误", name: "未知业务"}
error1.named("体验权限").err(1001).msg("您没有体验权限，请联系管理员获取");

error1.is("无体验权限错误") // true
error1.is(1001) // true
error.is(1000) // false

BizError.Failure(1002, "请求超时，请稍后再试", "网络"); 
// { err: 1002, msg: "请求超时，请稍后再试", name: "网络" }

BizError.Failure(2001, "支付密码错误，请输入正确的密码", "支付"); 
// { err: 2001, msg: "支付密码错误，请输入正确的密码", name: "支付"}
```

事件
---

```
import {Event} from 'jx-cores';
var eventor = new Event()

eventor.on('on.some.thing.happen', function () {
  // do something
});

eventor.emit('on.some.thing.happen')

eventor.once('on.some.thing.happen.and.expire', function () {
  // do it once
});

eventor.emit('on.some.thing.happen.and.expire')
eventor.emit('on.some.thing.happen.and.expire')


var handler = function (){}
var handler1 = function (){}

eventor.on('on.another.thing.happen', handler);
eventor.on('on.another.thing.happen', handler1);
eventor.off('on.another.thing.happen', handler);
eventor.offAll('on.another.thing.happen');
eventor.count('on.another.thing.happen'); // 0
```

Ajax 
---

小程序不可用

日志
---

*基本功能*

* 日志级别
* 模块信息、字段信息与格式
* profile 使用方法：https://www.jb51.net/article/59128.htm

*重要组件*

| 组件名称 | 对应类名 | 功能描述 |
| ------ | ------ | ------ |
| 日志器 | Logger | 提供了应用程序可一直使用的接口 |
| 处理器	| Handler |	将logger创建的日志记录发送到合适的目的输出 |
| 过滤器	| Filter| 提供了更细粒度的控制工具来决定输出哪条日志记录，丢弃哪条日志记录 |
| 格式器	| Formatter	| 决定日志记录的最终输出格式 |

*使用说明*

```
Logger.help() // 获取帮助文档

{
  "获取日志对象": "Logger.getLogger('测试')",
  "测试时间": [
    "logger.time('aaa');",
    "logger.timeEnd('aaa');"
  ],
  "表格打印": "logger.table([{a:1},{b:1}]);",
  "图片打印": "logger.image("http://pic16.nipic.com/20110926/6333052_165902361105_2.jpg")",
  "日志打印": [
    "logger.log(', d', ', a', ', b');",
    "logger.info(', d', ', a', ', b');",
    "logger.warn(', d', ', a', ', b');",
    "logger.error(', d', ', a', ', b');"
  ],
  "日志导出": [
    "var logs = logger.flush(2);",
    "console.log(logs);"
  ],
  "日志过滤": [
    "logger.setFilter(new LoggerFilter({",
    "  filter: (lvl, outputs) => {",
    "    if (lvl === Logger.Level.WARN) return true;",
    "    return false;",
    "  }",
    "}));"
  ],
  "日志处理": [
    "logger.setHandler(new LoggerHandler({",
    "  handle: (lvl)=> {",
    "    console.log(`收到日志： ${lvl}`)",
    "  }",
    "}));"
  ],
  "日志格式化": [
    "logger.setFormatter(new LoggerFormatter({",
    "  format: (lvl, outputs) => {",
    "    return `已达标, ${outputs}`;",
    "  }",
    "}))"
  ],
  "格式化输出(不支持object)": [
    "%s, 字符串",
    "%d/%i, 整数",
    "%f, 浮点数",
    "%o/%O, Object对象",
    "%c, css样式"
  ]
}
```

Session
---

小程序不可用


信号
---

```
import {Signal} from 'jx-cores';

var moduleIntializedSignal = new Signal();

var handler = function (){}
var handler1 = function (){}

moduleIntializedSignal.on(handler)
moduleIntializedSignal.once(handler1)
moduleIntializedSignal.off(handler1)
moduleIntializedSignal.offAll() // 注销所有监听者

moduleIntializedSignal.send({ xxx: {} })

moduleIntializedSignal.on(function (data) {
  // 依然能收到数据
  // do some thing
})

moduleIntializedSignal.dispose(); // 信号结束
```

Storage
---

小程序不可用