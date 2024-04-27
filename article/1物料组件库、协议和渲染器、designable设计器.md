# formily协议和渲染器、designable设计器

## formily协议驱动

本项目的H5和小程序动态渲染最核心的依赖是 `Formily.js` 的 `JSON Schema` 渲染能力
先可看官方文档
[协议驱动简单介绍](https://formilyjs.org/zh-CN/guide#%E5%8D%8F%E8%AE%AE%E9%A9%B1%E5%8A%A8)
[Schema协议详细介绍](https://react.formilyjs.org/zh-CN/api/shared/schema)

以todolist中每一项任务右边的删除按钮为示例

```json
{
  "type": "void", // 类型 void类型表单项就是没有关联表单数据
  "title": "Icon", // 标题 一般标题用于显示在FormItem（x-decorator 字段 UI 包装器组件）
  "x-component": "Icon", // 字段 UI 组件，对应在SchemaField创建时传入的组件，SchemaField 组件是专门用于解析JSON-Schema动态渲染表单的组件
  // https://react.formilyjs.org/zh-CN/api/components/schema-field
  "x-component-props": { // 字段 UI 组件属性，就是业务组件Props能拿到的参数
    "iconName": "check-disabled",
    "style": { // 组件样式
    },
    "eventsConfig": { // 本项目实现的事件配置
      // 点击事件表达式
      // $开头的变量是内置表达式作用域，主要用于在表达式中实现各种联动关系
      // https://react.formilyjs.org/zh-CN/api/shared/schema#%E5%86%85%E7%BD%AE%E8%A1%A8%E8%BE%BE%E5%BC%8F%E4%BD%9C%E7%94%A8%E5%9F%9F
      "scriptClick": "{{ () => { console.log($index, $array); $array.remove($index)} }}"
    }
  },
  "x-designable-id": "956d01mudrx",
  "x-index": 1
}
```

### 开发自己的formily组件

本项目使用 `@nutui/nutui-react-taro`
https://nutui.jd.com/taro/react/2x/#/zh-CN/guide/intro-react
可参考packages/ui/src/components目录

formily的字段模型核心包含了两类字段模型：数据型字段和虚数据型字段
数据型字段(Field)，核心是负责维护表单数据(表单提交时候的值)。
虚数据型字段(VoidField)，你可以理解为它就是一个阉割了数据维护能力的 Field，所以它更多的是作为容器维护一批字段的 UI 形式。
[字段模型](https://core.formilyjs.org/zh-CN/guide/field)

在ui/src/components目录中，Widget开头的组件和Button是VoidField，只用来展示UI的，不跟表单数据做关联，
其余的像 CheckBox、DatePicker、Input组件是跟表单数据做关联的，用 `@formily/react` 中的 `connect`, `mapProps` 方法包装组件来连接表单，最基础的数据型组件要求Props有 `value` 和 `onChange`

### Form组件

Form组件是地基，用 `@formily/react` 中的 `FormProvider` 组件接收一个Form实例，为children提供formily表单context。
本项目里ui/src/components里面 实现了Form组件和FormPage组件，
FormPage组件除了formily提供的能力外就是一个Taro的View组件，
Form组件则多了nutui Form组件的样式

FormPage组件代码如下

```tsx
import React, { createContext, useContext } from 'react'
import { Form as FormType, ObjectField } from '@formily/core'
import {
  ExpressionScope,
  FormProvider,
  JSXComponent,
  useParentForm,
} from '@formily/react'
import { View } from '@tarojs/components'

import { PreviewText } from '../PreviewText'


export const FormPage = ({
  form,
  component,
  previewTextPlaceholder,
  className,
  style,
  children,
}) => {
  const top = useParentForm()
  // 重要的是这里 我们的Form组件就简单的用Taro的View组件包住子组件渲染
  // ExpressionScope是用context来给 json-schema 表达式传递局部作用域，我们可以用它当做数据源
  // PreviewText.Placeholder也是一个context 给预览态显示文本一个缺省值，目前也不重要
  const renderContent = (_form: FormType | ObjectField) => (
    <ExpressionScope value={{ $$form: _form }}>
      <PreviewText.Placeholder value={previewTextPlaceholder}>
        <View className={className} style={style}>
          {children}
        </View>
      </PreviewText.Placeholder>
    </ExpressionScope>
  )
  if (form)
    // 最重要的是这里，有FormProvider才能提供fomily在react组件中的一系列能力
    return <FormProvider form={form}>{renderContent(form)}</FormProvider>
  if (!top) throw new Error('must pass form instance by createForm')
  return renderContent(top)
}

export default FormPage
```

### FormItem

`nutui` 提供了一些表单组件
![nutui-FormItem](../showImage/nutui-FormItem.png)

如图所见FormItem的作用就是显示label、必填、校验文案等，并且让表单布局更加美观，我们需要混入formily能力。
我们要改造一下FormItem的最外层，要让designable属性能够挂到dom上，并且阉割掉原来UI库有关Form的功能，化为己用。
用 `@formily/react` 的 `connect`，`mapProps` 来让FormItem组件可以链接到表单

### UI组件适配formily

组件适配formily最简单的处理的话只需要用connect包裹
需要修改表单field属性映射到组件props的话就要使用mapProps
https://react.formilyjs.org/zh-CN/api/shared/map-props

```tsx
import React from 'react'
import { connect, mapProps, mapReadPretty } from '@formily/react'
import { Input as Component } from '@nutui/nutui-react-taro'
import {
  InputProps,
} from '@nutui/nutui-react-taro/dist/types/index'

import { PreviewText } from '../PreviewText'

import { typePropsFields } from '../type'

type typeProps = typePropsFields & InputProps & {
  clearIcon: typeIconImageProps
}

import { getIconImageConfig, typeIconImageProps } from '../Icon/IconImage'

export const Input = connect(
  ({ clearIcon, ...props }: typeProps) => {
    // 图标配置封装
    const propNames = ['clearIcon']
    const IconImageConfig = getIconImageConfig(propNames, {
      clearIcon,
    })
    if (IconImageConfig.noActiveIcon) {
      IconImageConfig.icon = IconImageConfig.noActiveIcon
      delete IconImageConfig.noActiveIcon
    }
    if (props.type === 'number') {
      const onChange = props.onChange
      props.onChange = (val) => {
        onChange(Number(val))
      }
    }
    return <Component {...props}></Component>
  },
  mapProps((props, field) => {
    return {
      ...props,
    }
  }),
  mapReadPretty(PreviewText.Input)
)
```

formily的[Field模型](https://core.formilyjs.org/zh-CN/api/models/field)里像value、onChange、disabled等表单属性跟大多数UI组件库是适配的，nutui的input组件可以配置clearIcon，我们可以做额外的适配。

### SchemaField

最后我们用 `createSchemaField` 注册一下适配好的UI组件，创建一个用于解析JSON-Schema动态渲染表单的组件，并
在本项目 packages/ui/src/components/SchemaField.ts中，创建SchemaField并导出在设计器和实际项目中使用

```ts
import { createSchemaField } from '@formily/react'

import { ArrayViews } from './ArrayViews'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { DatePicker } from './DatePicker'
import { Form } from './Form'
import { FormItem } from './FormItem'
import { Icon } from './Icon'
import { Image } from './Image'
import { Input } from './Input'
import { InputNumber } from './InputNumber'
import { Radio } from './Radio'
import { Range } from './Range'
import { Rate } from './Rate'
import { Switch } from './Switch'
import { Text } from './Text'
import { TextArea } from './TextArea'
import { WidgetBase } from './WidgetBase'
import { WidgetCell } from './WidgetCell'
import { WidgetCellGroup } from './WidgetCellGroup'
import { WidgetList } from './WidgetList'
import { WidgetPopup } from './WidgetPopup'

export const SchemaField = createSchemaField({
  components: {
    ArrayViews,
    Button,
    Checkbox,
    DatePicker,
    Form,
    FormItem,
    Icon,
    Image,
    Input,
    InputNumber,
    Radio,
    Range,
    Rate,
    Switch,
    Text,
    TextArea,
    WidgetBase,
    WidgetCell,
    WidgetCellGroup,
    WidgetList,
    WidgetPopup,
  },
})
```

组件库准备好了之后，我们可以选择用 `rollup` 打包，也可以选择在项目中直接使用 `tsx` 文件。

## designable可视化设计器使用Taro组件

以下内容可参考本项目 `packages/editor` 目录

由于 `Taro` 跨端的特性，让组件库在 `h5` 环境下展示是一定可以的，不过有两种方案：

1. 用完整的Taro项目，接入designable API和组件，适配好在PC上的展示 （这种方式打包较慢，要Taro4.0提供vite打包后才快 可参考仓库https://github.com/SHRaymondJ/lowcode-formily-taro-vue3）
2. 设计器适配部分Taro在h5中的逻辑，不使用Taro打包

本项目使用方案二

首先 `@tarojs/components` 使⽤了 `Stencil` 去实现了⼀个基于 `WebComponents` 且遵循微信⼩程序规范的组件库，用 `reactify-wc` 让React项目中能够使用 `WebComponent`，`stenciljs` 打包的组件产物中有 `defineCustomElements`，调用一下才可以把 `WebComponents` 注册到浏览器中
![taro-h5-webComponents](../showImage/taro-h5-webComponents.png)
我们在设计器项目中需要把该方法导出来用一下，还需要引入Taro组件样式
其余H5页面处理可以看 `node_modules/@tarojs/taro-loader/lib/h5.js`

在设计器 `main.tsx` 中

```tsx
import React from 'react'
import { findDOMNode, render, unstable_batchedUpdates } from 'react-dom'
import ReactDOM, { createRoot } from 'react-dom/client'
import { defineCustomElements } from '@tarojs/components/dist/esm/loader.js'
import { createReactApp } from '@tarojs/plugin-framework-react/dist/runtime'
import { createH5NativeComponentConfig } from '@tarojs/plugin-framework-react/dist/runtime'

import App from './app'

// Taro H5 初始化
Object.assign(ReactDOM, { findDOMNode, render, unstable_batchedUpdates }) // Taro H5对于React18的处理
defineCustomElements(window) // 注册WebComponents组件
const appObj = createReactApp(App, React, ReactDOM, {
  appId: 'root'
})
createH5NativeComponentConfig(null, React, ReactDOM) // Taro页面管理逻辑和Hooks初始化
appObj.onLaunch()
```

打包配置参考 `plugin-framework-react` 这个taro包中的处理
在 'node_modules/@tarojs/plugin-framework-react/dist/index.js' 文件中，有个 `modifyH5WebpackChain` 方法来处理编译到H5时的webpack配置

```js
function modifyH5WebpackChain(ctx, framework, chain) {
    var _a;
    setLoader$1(framework, chain);
    setPlugin(ctx, framework, chain);
    const { isBuildNativeComp = false } = ((_a = ctx.runOpts) === null || _a === void 0 ? void 0 : _a.options) || {};
    const externals = {};
    if (isBuildNativeComp) {
        // Note: 该模式不支持 prebundle 优化，不必再处理
        externals.react = {
            commonjs: 'react',
            commonjs2: 'react',
            amd: 'react',
            root: 'React'
        };
        externals['react-dom'] = {
            commonjs: 'react-dom',
            commonjs2: 'react-dom',
            amd: 'react-dom',
            root: 'ReactDOM'
        };
        if (framework === 'preact') {
            externals.preact = 'preact';
        }
        chain.merge({
            externalsType: 'umd'
        });
    }
    chain.merge({
        externals,
        module: {
            rule: {
                'process-import-taro-h5': {
                    test: /taro-h5[\\/]dist[\\/]api[\\/]taro/,
                    loader: require.resolve('./api-loader')
                }
            }
        },
    });
    chain.merge({
        externals,
        module: {
            rule: {
                'process-import-taro-harmony-hybrid': {
                    test: /plugin-platform-harmony-hybrid[\\/]dist[\\/]api[\\/]apis[\\/]taro/,
                    loader: require.resolve('./api-loader')
                }
            }
        },
    });
}
function setLoader$1(framework, chain) {
    function customizer(object = '', sources = '') {
        if ([object, sources].every(e => typeof e === 'string'))
            return object + sources;
    }
    chain.plugin('mainPlugin')
        .tap(args => {
        args[0].loaderMeta = lodash.mergeWith(getLoaderMeta(framework), args[0].loaderMeta, customizer);
        return args;
    });
}
function setPlugin(ctx, framework, chain) {
    var _a, _b;
    const config = ctx.initialConfig;
    const webpackConfig = chain.toConfig();
    const isProd = webpackConfig.mode === 'production';
    if (!isProd && ((_b = (_a = config.h5) === null || _a === void 0 ? void 0 : _a.devServer) === null || _b === void 0 ? void 0 : _b.hot) !== false) {
        // 默认开启 fast-refresh
        if (framework === 'react') {
            chain
                .plugin('fastRefreshPlugin')
                .use(require('@pmmmwh/react-refresh-webpack-plugin'));
        }
        else if (framework === 'preact') {
            chain
                .plugin('hotModuleReplacementPlugin')
                .use(require('webpack').HotModuleReplacementPlugin);
            chain
                .plugin('fastRefreshPlugin')
                .use(require('@prefresh/webpack'));
        }
    }
}
```

所以设计器打包需要额外添加以下Taro配置
```ts
export default {
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@tarojs/components$': '@tarojs/components/dist-h5/react', // taro3.6及以上为  @tarojs/components/lib/react
      '@tarojs/taro': '@tarojs/taro-h5',
    },
  },
  module: {
    rules: [
      {
        test: /taro-h5[\\/]dist[\\/]index/,
        loader: require.resolve(
          '@tarojs/plugin-framework-react/dist/api-loader.js'
        ),
      },
      ...
    ],
  },
  ...
}
```

这样就可以获得一个残缺的 `Taro h5 React` 环境，会有一些api不支持，比如路由跳转。

### 组件封装物料

@designable/core 提供了两个api
`createResource` 创建资源基础信息，用于左侧拖拽组件
`createBehavior` 创建组件的行为，locals、propsSchema 可以描述右侧属性配置栏中可以配置的属性

组件的Behavior，大致就是描述一下组件有哪些属性需要在设计器上配置的，可以配置哪些内容，还有设计器与组件的交互，例如点击、拖拉这个组件会有什么反应。
给组件添加资源，简单的理解就是添加一些在设计器展示的内容，比如需要展示在左边组件区，那就需要一个icon
![designable-antd-left](../showImage/designable-antd-left.png)
有了这些配置，组件就变成了 `低代码物料`

designable里面可以先实现一个Field组件来定义默认的Behavior和Resource

```tsx
Field.Behavior = createBehavior({
  name: 'Field',
  selector: 'Field',
  designerLocales: AllLocales.Field,
  designerProps: {
    ...behaviorOfResizeAndtranslate,
  },
})
```

用formily的Input组件做designable物料组件，通过 ***extends: ['Field']*** 来继承默认的Behavior和Resource

```tsx
import React from 'react'
import { Input as component } from 'ui-nutui-react-taro'

import {
  createBehavior,
  createResource,
} from '@/designable/designable-core/src'
import { DnFC } from '@/designable/designable-react/src'

import { AllLocales } from '../../locales'
import { AllSchemas } from '../../schemas'
import { createFieldSchema } from '../Field'
import { iconimageDesignableConfig } from '../shared'

export const Input: DnFC<React.ComponentProps<typeof component>> = component

const { imgsProperties, imgsLocales } = iconimageDesignableConfig([
  {
    name: 'clearIcon',
    locale: '清除图标',
  },
])

const propsSchema = createFieldSchema({
  component: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['text', 'number', 'digit', 'idcard'],
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          defaultValue: 'text',
        },
      },
      placeholder: {
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      align: {
        type: 'string',
        enum: ['left', 'center', 'right'],
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          defaultValue: 'left',
        },
      },
      maxLength: {
        type: 'number',
        'x-decorator': 'FormItem',
        'x-component': 'NumberPicker',
      },
      clearable: {
        type: 'boolean',
        'x-decorator': 'FormItem',
        'x-component': 'Switch',
      },
      confirmType: {
        type: 'string',
        enum: [
          {
            label: '发送',
            value: 'send',
          },
          {
            label: '搜索',
            value: 'search',
          },
          {
            label: '下一个',
            value: 'next',
          },
          {
            label: '前往',
            value: 'go',
          },
          {
            label: '完成',
            value: 'done',
          },
        ],
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          defaultValue: 'done',
        },
      },
      password: {
        type: 'boolean',
        'x-decorator': 'FormItem',
        'x-component': 'Switch',
      },
      ...imgsProperties,
    },
  },
  props: {
    'component-events-group': [],
  },
}) as any

Input.Behavior = createBehavior({
  name: 'Input',
  extends: ['Field'],
  selector: (node) => node.props['x-component'] === 'Input',
  designerProps: {
    propsSchema,
    defaultProps: {},
  },
  designerLocales: {
    'zh-CN': {
      title: '输入框',
      settings: {
        'x-component-props': {
          type: '输入框类型',
          placeholder: 'placeholder',
          align: '输入框内容对齐方式',
          maxLength: '限制最长输入字符',
          clearable: '展示清除Icon',
          confirmType: '键盘右下角按钮的文字(小程序)',
          password: '是否是密码',
          ...imgsLocales,
        },
      },
    },
  },
})

Input.Resource = createResource({
  icon: 'InputSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        type: 'string',
        title: 'Input',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
    },
  ],
})
```

![Input属性配置](../showImage/designable-input-settings.png)
如图所见右侧属性配置中 `字段属性` 是默认的表单属性配置，组件属性部分通常就是针对每个组件额外字段处理部分，在 `propsSchema` 中定义

### designable使用物料

准备预览运行面板，使用 `Form组件` 和 `SchemaField组件` 提供运行时渲染能力，与实际消费端的区别是需要用 `designable` 提供的 `transformToSchema` 把拖拉拽面板中的组件树转成JSON协议。

```js
import React, { useMemo } from 'react'
import { createForm } from '@formily/core'
import { createSchemaField } from '@formily/react'
import {
    Input,
    ...
} from '@formily/antd'
import { Card, Slider, Rate } from 'antd' // 一些简单的布局组件或输入组件，即使不适配也能用起来
import { TreeNode } from '@pind/designable-core'
import { transformToSchema } from '@pind/designable-formily-transformer'

const SchemaField = createSchemaField({
  components: {
    Input,
    Card,
    ...
  },
})

export interface IPreviewWidgetProps {
  tree: TreeNode
}

export const PreviewWidget: React.FC<IPreviewWidgetProps> = (props) => {
  const form = useMemo(() => createForm(), [])
  const { form: formProps, schema } = transformToSchema(props.tree)
  return (
    <Form {...formProps} form={form}>
      <SchemaField schema={schema} />
    </Form>
  )
}
```

app.tsx中，把物料组件导入， 放入 `ResourceWidget` 和 `ComponentTreeWidget` 两个设计器组件中。
放入 `ResourceWidget` 是为了在设计器左侧展示可用物料组件
`ComponentTreeWidget` 则是组件树渲染器，需要注册一下物料组件

```tsx
              <ResourceWidget
                title="sources.Inputs"
                sources={[Input, InputNumber, TextArea, Checkbox, Radio, Rate, Switch]}
              />
              <ResourceWidget
                title="sources.Displays"
                sources={[Button, Icon, Image, Text]}
              />
              <ResourceWidget title="sources.Arrays" sources={[ArrayViews]} />
              <ResourceWidget
                title="sources.Layouts"
                sources={[
                  Form,
                  WidgetBase,
                  WidgetCell,
                  WidgetCellGroup,
                  WidgetList,
                  WidgetPopup,
                ]}
              />
```

```tsx
              <ViewPanel type="DESIGNABLE">
                {() => (
                  <ComponentTreeWidget
                    className="ComponentTreeWidget"
                    components={{
                      ArrayViews,
                      Button,
                      Checkbox,
                      Form,
                      FormPage,
                      Field,
                      Icon,
                      Image,
                      Input,
                      InputNumber,
                      Radio,
                      Rate,
                      Switch,
                      Text,
                      TextArea,
                      WidgetBase,
                      WidgetCell,
                      WidgetCellGroup,
                      WidgetList,
                      WidgetPopup,
                    }}
                  />
                )}
              </ViewPanel>
              <ViewPanel type="JSONTREE" scrollable={false}>
                {(tree, onChange) => {
                  return <SchemaEditorWidget tree={tree} onChange={onChange} />
                }}
              </ViewPanel>
              <ViewPanel type="PREVIEW">
                {(tree) => <PreviewWidget tree={tree} />}
              </ViewPanel>
```
