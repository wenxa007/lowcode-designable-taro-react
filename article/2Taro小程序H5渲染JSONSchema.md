# Taro小程序H5渲染JSONSchema

## 适配小程序端

我们开发好的组件库就是基于Taro组件标签写的，所以在Taro项目编译到H5或小程序就能在想要的平台中展示设计好的页面中。
要渲染 `可视化搭建设计器` 产出 `JSONSchema`，需要使用 `@formily/core` + `@formily/react` 以及组件库中的 `SchemaField`

**但是要用在小程序端最主要有两个问题**
**1.在PC设计器上，设置组件样式的单位是px，需要转换为rem**

这个问题主要是使用 `Taro.pxTransform` 将以px为单位的数字转为 以rem为单位的字符串，配合正则就可以实现对某段style进行转换

```js
const pxToRem = (str) => {
  const reg = /(\d+(\.\d*)?)+(px)/gi
  return String(str).replace(reg, function (x) {
    const val = x.replace(/px/gi, '')
    return Taro.pxTransform(Number(val))
  })
}
```

对JSONSchema进行递归转换单位就解决了这个问题

2.**[formily Schema 联动协议](https://react.formilyjs.org/zh-CN/api/shared/schema#schemareactions)需要动态执行JS代码，但小程序不能使用 `Function`/`eval`，需要一个JS写的JS解释器**

举一个上篇文章中的例子，表单中有字段为a的输入框和字段为b的输入框，单a的值为 'hidden' 时把b隐藏掉
![howToReaction](../showImage/howToReaction/2.png)
![howToReaction](../showImage/howToReaction/3.png)

那么这里需要动态执行的代码(表达式)是

```js
$form.values.a !== 'hidden'
```

在 `@formily/json-schema` 中源码是使用 `new Function` 去执行的，把动态代码置于 `formily作用域` 运行以获得访问表单数据的能力

```js
var Registry = {
    silent: false,
    compile: function (expression, scope) {
        if (scope === void 0) { scope = {}; }
        if (Registry.silent) {
            try {
                return new Function('$root', "with($root) { return (".concat(expression, "); }"))(scope);
            }
            catch (_a) { }
        }
        else {
            return new Function('$root', "with($root) { return (".concat(expression, "); }"))(scope);
        }
    },
};
```

`@formily/json-schema` 中导出的 `Schema` 里面 `registerCompiler` 的方法允许使用者注册自己的逻辑
本项目用JS写的JS解释器去运行动态代码

```js
export function miniCompiler(expression, scope, isStatement?) {
  if (scope === void 0) {
    scope = {}
  }
  const scopeKey = Object.keys(scope).filter((str) => str.includes('$'))
  scopeKey.forEach((key) => {
    const reg = new RegExp(`\\${key}`, 'g')
    expression = expression.replace(reg, 'scope.' + key)
  })
  const bridge = { current: null }
  const context = vm.createContext({ bridge, expression, scope, console })
  try {
    if (isStatement) {
      vm.runInContext(`${expression} `, context)
      return
    }
    vm.runInContext(`bridge.current = ${expression} `, context)
  } catch (err) {
    console.error(err)
  }
  return bridge.current
}
```

## 页面渲染

- 用 `@formily/core` 导出的 `createForm` 创建form实例
- 用fomrily组件库中的 `Form` 组件(实际上用了`@formily/react` 导出的 `FormProvider`)桥接form实例与UI
- 用fomrily组件库中的 `SchemaField` 组件(实际上用了`@formily/react` 导出的 `createSchemaField`)去渲染 `JOSNSchema`，`JOSNSchema` 使用前先处理一遍 `style` 单位

具体参考 packages/mobile/src/pages/index/index.tsx