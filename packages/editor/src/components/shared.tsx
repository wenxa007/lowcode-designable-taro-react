import React from 'react'
import { ISchema } from '@formily/json-schema'
import { IconFont } from '@nutui/icons-react-taro'
import { Select } from 'antd'
import * as lodash from 'lodash-es'

import { IResizable, ITranslate } from '@/designable/designable-core/src'
import { CSSStyleLocales } from '@/locales/Field'

import * as AllSchemas from '../schemas/all'

import iconNames from './iconNames.json'

export const IconSelectProperties = {
  type: 'string',
  'x-decorator': 'FormItem',
  'x-component': ({ value, onChange }) => {
    return (
      <Select
        value={value}
        onChange={onChange}
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          String(option!.value).toLowerCase().includes(input.toLowerCase())
        }
      >
        {iconNames.map((key) => {
          const TheIcon = <IconFont name={key}></IconFont>
          return (
            <Select.Option value={key.toLowerCase()} key={key}>
              {TheIcon}
            </Select.Option>
          )
        })}
      </Select>
    )
  },
}

export const imageDesignableConfig = {
  properties: {
    src: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
    },
    mode: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      enum: [
        'scaleToFill',
        'aspectFit',
        'aspectFill',
        'widthFix',
        'heightFix',
        'top',
        'bottom',
        'center',
        'left',
        'right',
        'topLeft',
        'topRight',
        'bottomLeft',
        'bottomRight',
      ],
      default: 'aspectFill',
    },
    lazyLoad: {
      type: 'boolean',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
    },
    // width: {
    //   type: 'string',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'SizeInput',
    // },
    // height: {
    //   type: 'string',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'SizeInput',
    // },
    radius: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'SizeInput',
    },
  },
}

export const iconFontDesignableConfig = {
  properties: {
    iconName: IconSelectProperties,
    size: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'SizeInput',
    },
    useWidthAsSize: {
      type: 'boolean',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
    },
    // width: {
    //   type: 'string',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'SizeInput',
    // },
    // height: {
    //   type: 'string',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'SizeInput',
    // },
    color: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'ColorInput',
    },
    classPrefix: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
    },
    fontClassName: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
    },
    // tag: {
    //   type: 'string',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Input',
    // },
  },
}

export function iconimageDesignableConfig(
  propertyArr: {
    name: string
    locale: string
  }[]
) {
  const obj = {
    imgsProperties: {} as Record<string, ISchema>,
    imgsLocales: {} as any,
  }
  propertyArr.forEach(({ name, locale }) => {
    obj.imgsProperties[name + '-group'] = {
      type: 'void',
      'x-component': 'DrawerSetter',
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        labelStyle: {
          display: 'none',
        },
      },
      properties: {
        [name + '.imageProps']: {
          type: 'object',
          'x-component': 'CollapseItem',
          properties: Object.assign(
            lodash.cloneDeep(imageDesignableConfig.properties),
            {
              style: lodash.cloneDeep(AllSchemas.CSSStyle),
            }
          ),
          'x-component-props': {
            title: '图片',
            defaultExpand: false,
          },
        },
        [name + '.iconFontProps']: {
          type: 'object',
          'x-component': 'CollapseItem',
          properties: Object.assign(
            lodash.cloneDeep(iconFontDesignableConfig.properties),
            {
              style: lodash.cloneDeep(AllSchemas.CSSStyle),
            }
          ),
          'x-component-props': {
            title: '图标',
            defaultExpand: false,
          },
        },
      },
    }
    obj.imgsLocales[name + '-group'] = locale
    obj.imgsLocales[name] = {
      imageProps: {
        ...imageLocals,
        style: CSSStyleLocales,
      },
      iconFontProps: {
        ...iconFontLocals,
        style: CSSStyleLocales,
      },
    }
  })
  return obj
}

export const imageLocals = {
  src: '图片资源地址',
  mode: '图片裁剪、缩放的模式',
  lazyLoad: '图片懒加载',
  width: '宽度，默认单位px',
  height: '高度，默认单位px',
  radius: '圆角大小',
}

export const iconFontLocals = {
  iconName: '图标名称或图片链接',
  color: '图标颜色',
  size: '图标大小',
  useWidthAsSize: '使用宽度作为size',
  width: '图标宽度',
  height: '图标高度',
  classPrefix: '类名前缀，用于使用自定义图标',
  fontClassName: '自定义icon字体基础类名',
}

export const behaviorOfResizeAndtranslate = {
  resizable: {
    width: true,
    height: true,
    end(node, element) {
      const width = Number(
        node.props?.style?.width ?? element.getBoundingClientRect().width
      )
      const height = Number(
        node.props?.style?.height ?? element.getBoundingClientRect().height
      )
      node.props = node.props || {}
      const styleKey = node.props['x-decorator']
        ? 'x-decorator-props'
        : 'x-component-props'
      node.props[styleKey] = node.props[styleKey] || {}
      node.props[styleKey].style = node.props[styleKey].style || {}
      node.props[styleKey].style.width = width + 'px'
      node.props[styleKey].style.height = height + 'px'
    },
  } as IResizable,
  translatable: {
    x: true,
    y: true,
    reset(node) {
      node.props = node.props || {}
      const styleKey = node.props['x-decorator']
        ? 'x-decorator-props'
        : 'x-component-props'
      node.props[styleKey] = node.props[styleKey] || {}
      node.props[styleKey].style = node.props[styleKey].style || {}
      const nodeStyle = node.props[styleKey].style
      if (!nodeStyle.left?.includes('px')) {
        nodeStyle.left = '0px'
      }
      if (!nodeStyle.top?.includes('px')) {
        nodeStyle.top = '0px'
      }
    },
    end(node, diffX, diffY) {
      node.props = node.props || {}
      const styleKey = node.props['x-decorator']
        ? 'x-decorator-props'
        : 'x-component-props'
      node.props[styleKey] = node.props[styleKey] || {}
      node.props[styleKey].style = node.props[styleKey].style || {}
      const nodeStyle = node.props[styleKey].style

      let left = 0
      const theString1 = nodeStyle.left || '0px'
      if (theString1?.includes('px')) {
        left = Number(String(theString1).slice(0, -2))
      }
      nodeStyle.left = left + parseInt(String(diffX)) + 'px'

      let top = 0
      const theString2 = nodeStyle.top || '0px'
      if (theString2?.includes('px')) {
        top = Number(String(theString2).slice(0, -2))
      }

      nodeStyle.top = top + parseInt(String(diffY)) + 'px'
    },
  } as ITranslate,
}
