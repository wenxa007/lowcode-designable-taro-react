# 前端可视化搭建与designable

已下内容可以结合 https://github.com/pindjs/designable，跑 formily/antd 目录下的 start 命令启动

## designable介绍

> 组件化搭建领域抽象的最好的搭建引擎，与formily同样的配方，不同的只是解决的不同问题，作为底层搭建引擎，它该有的能力都有，最基础的拖拽，就支持了很多形态的，比如，多选拖拽，跨区域拖拽，跨工作区拖拽，跨iframe拖拽，还有多选，快捷键多选，shift/ctrl加点击交集化多选，还有基于鼠标形态切换的选区式多选，再说说扩展性，它本身内核是一个框架无关的内核，只负责管理模型状态，然后我们想要扩展ui的话，只需要替换ui组件即可，designable本身提供了一系列开箱即用的ui组件，且是绝对遵循组合模式的方案，不搞黑盒插件模式，你想用就用它，不想用就替换它，因为组件本身是无状态的，状态都在内核中管理，所以这就使得了designable的扩展性，极其的强

如上 `designable` [开源库作者](https://www.zhihu.com/question/458478254/answer/1978603907)所述，`designable` 是一个设计器引擎，提供拖拽搭建能力。
我们可以用它来往上层封装出具体产品，比如表单设计器、低代码平台。

## 前端页面可视化搭建与低代码

首先厘清一下本文的开发范围。一般市面上推出的低代码产品会包含 界面可视化搭建、后端数据存储、应用管理发布等功能，偏向零代码方案面向非开发者；但如 `lowcode-engine` [阿里低代码引擎文档](https://lowcode-engine.cn/docV2/intro)中所说，低代码本身也不仅仅是为技术小白准备的。在实践中，低代码因为通过组件化、模块化的思路让业务的抽象更加容易，而且在扩展及配置化上带来了更加新鲜的模式探索，技术人员的架构设计成本和实施成本也就降了很多。作为前端开发者，我们接下来先重点关注 `web前端页面可视化搭建` 如何开发。

低代码渲染有一个简单的公式

![低代码渲染公式](https://pic1.zhimg.com/80/v2-d89b75a6d619e67fa4e8112398b61dc8_720w.jpg)

按这个公式的理解，可视化搭建中有三个角色

- `组件库`。前端展示组件，不利用 JSONSchema 也可以像 `antd` 一样普通的用代码展示出来。
- `协议和渲染器`。渲染器根据协议解析 JSONSchema 最终展示出组件。
- `可视化设计器`。基于渲染器展示界面，加入拖拽和配置能力，高效产出 JSONSchema。

可以说 `组件库` 和 `渲染器` 是基础，有了这两消费端已经可以进行渲染了，`可视化设计器` 是锦上添花。

`渲染器` 大概要做以下内容：

- 获取源码组件
- 解析组件的 props
- 获取组件的 children
- 保留并传入上下文，包括循环上下文，插槽上下文等;
- 节点更新，当参数变化时需要更新对应的节点

## 协议、渲染器 与 组件库

`designable` 本身只提供拖拉拽等能力，协议、渲染器 主要依赖 [formily表单解决方案](https://react.formilyjs.org/zh-CN/api/components/schema-field) 的协议驱动能力(`标准JSON-Schema`)

![formily协议绑定](https://img.alicdn.com/imgextra/i3/O1CN01jLCRxH1aa3V0x6nw4_!!6000000003345-55-tps-2200-1147.svg)

**组件适配协议，要基于@formily的api进行改造**，适配协议后好处就是我们可以依赖 `Formily` MVVM的能力，不止可以渲染页面，还可以低成本地 `支配` 页面，如 表单校验、异步数据源、[页面联动逻辑](https://formilyjs.org/zh-CN/guide/advanced/linkages)，最简单的例子是根据用户行为决定一个组件的显示和隐藏，就这么一个简单的需求很多低代码产品都不支持。

怎么接入可以参考[@formily/antd](https://antd.formilyjs.org/zh-CN/components)

如果是使用第三方组件库，那么根据主框架是 `react` 或者 `vue` 可以分别用 [@formily/react](https://react.formilyjs.org/zh-CN/api/shared/connect) / [@formily/vue](https://vue.formilyjs.org/api/shared/connect.html) UI桥接层。
![formily架构](https://img.alicdn.com/imgextra/i3/O1CN01iEwHrP1NUw84xTded_!!6000000001574-55-tps-1939-1199.svg)
