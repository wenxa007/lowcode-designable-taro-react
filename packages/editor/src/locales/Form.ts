import { createLocales } from '@/designable/designable-core/src'
import { Component } from './Component'

export const Form = createLocales(Component, {
  'zh-CN': {
    title: '表单',
    settings: {
      labelCol: '标签网格宽度',
      wrapperCol: '组件网格宽度',
      colon: '是否有冒号',
      labelAlign: {
        title: '标签对齐',
        dataSource: ['左对齐', '居中', '右对齐'],
      },
      wrapperAlign: {
        title: '组件对齐',
        dataSource: ['左对齐', '居中', '右对齐'],
      },
      labelWrap: '标签换行',
      wrapperWrap: '组件换行',
      labelWidth: '标签宽度',
      wrapperWidth: '组件宽度',
      fullness: '组件占满',
      inset: '内联布局',
      shallow: '是否浅传递',
      bordered: '是否有边框',
      size: { title: '尺寸', dataSource: ['大', '小', '默认', '继承'] },
      layout: { title: '布局', dataSource: ['垂直', '水平', '内联', '继承'] },
      feedbackLayout: {
        title: '反馈布局',
        dataSource: ['宽松', '紧凑', '弹层', '无', '继承'],
      },
      tooltipLayout: {
        title: '提示布局',
        dataSource: ['图标', '文本', '继承'],
      },
    },
  }
})
