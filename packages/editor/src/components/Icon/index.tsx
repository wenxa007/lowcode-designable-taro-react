import React from 'react'
import { Icon as Component } from 'ui-nutui-react-taro'

import {
  createBehavior,
  createResource,
} from '@/designable/designable-core/src'
import { DnFC } from '@/designable/designable-react/src'

import { AllLocales } from '../../locales'
import { AllSchemas } from '../../schemas'
import { createVoidFieldSchema } from '../Field'
import { iconFontDesignableConfig, iconFontLocals } from '../shared'

import icon from '../../assets/icon.png'

export const Icon: DnFC<React.ComponentProps<typeof Component>> = (props) => {
  return <Component {...props}></Component>
}
const propsSchema = createVoidFieldSchema({
  component: {
    type: 'object',
    properties: {
      useValue: {
        type: 'boolean',
        'x-decorator': 'FormItem',
        'x-component': 'Switch',
      },
      ...iconFontDesignableConfig.properties
    },
  },
}) as any

const customStyles = {}
const styleSchema =
  propsSchema.properties['component-style-group'].properties[
    'x-component-props.style'
  ].properties
Object.entries(customStyles).forEach(
  (values) => (styleSchema[`style.${values[0]}`] = values[1])
)

Icon.Behavior = createBehavior({
  name: 'Icon',
  extends: ['Field'],
  selector: (node) => node.props['x-component'] === 'Icon',
  designerProps: {
    propsSchema,
    defaultProps: {},
  },
  designerLocales: {
    'zh-CN': {
      title: 'Icon',
      settings: {
        'x-component-props': {
          useValue: '	使用表单字段值',
          ...iconFontLocals,
        },
      },
    },
  },
})

Icon.Resource = createResource({
  icon: icon,
  elements: [
    {
      componentName: 'Field',
      props: {
        type: 'string',
        title: 'Icon',
        'x-component': 'Icon',
        'x-component-props': {
          iconName: 'face-smile',
          useWidthAsSize: true,
          style: {
            width: '40px',
            height: '40px',
          },
        },
      },
    },
  ],
})
