import React, { useRef, useState } from 'react'
import { ISchema, useField, useForm } from '@formily/react'
import { Button, Input, InputNumber, Popover, Select } from 'antd'

import { MonacoInput } from '@/designable/designable-react-settings-form/src'

export const CSSStyle: ISchema = {
  type: 'void',
  properties: {
    'style.json': {
      type: 'void',
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        labelStyle: {
          display: 'none',
        },
      },
      'x-component': () => {
        const [initStyle, setInitStyle] = useState(JSON.stringify({}))
        const refValue = useRef(initStyle)
        const path = useField().parent.props.name
        const form = useForm()
        return (
          <Popover
            content={
              <div
                style={{
                  width: 500,
                  height: 300,
                  marginLeft: -16,
                  marginRight: -16,
                  marginBottom: -12,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    marginBottom: 12,
                    textAlign: 'center',
                  }}
                >
                  可以自定义样式和修改nutui组件样式变量
                </div>
                <MonacoInput
                  language="JSON"
                  defaultValue={initStyle}
                  onChange={(value) => {
                    refValue.current = value
                  }}
                />
              </div>
            }
            trigger="click"
            onOpenChange={(visible) => {
              try {
                if (visible) {
                  const _initStyle = JSON.stringify(
                    form.getValuesIn(path),
                    null,
                    2
                  )
                  setInitStyle(_initStyle)
                } else {
                  form.setValuesIn(path, JSON.parse(refValue.current))
                }
              } catch (err) {
                console.log(err)
              }
            }}
          >
            <Button block>编辑样式JSON</Button>
          </Popover>
        )
      },
    },
    'style.position': {
      type: 'string',
      'x-decorator': 'FormItem',
      default: 'relative',
      'x-component': 'Select',
      enum: [
        { label: 'static', value: 'static' },
        { label: 'relative', value: 'relative' },
        { label: 'absolute', value: 'absolute' },
        { label: 'fixed', value: 'fixed' },
        { label: 'sticky', value: 'sticky' },
      ],
    },
    'style.top': {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'SizeInput',
    },
    'style.left': {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'SizeInput',
    },
    'style.right': {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'SizeInput',
    },
    'style.bottom': {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'SizeInput',
    },
    'style.width': {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'SizeInput',
    },
    'style.height': {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'SizeInput',
    },
    'style.display': {
      'x-component': 'DisplayStyleSetter',
    },
    'style.background': {
      'x-component': 'BackgroundStyleSetter',
    },
    'style.boxShadow': {
      'x-component': 'BoxShadowStyleSetter',
    },
    'style.font': {
      'x-component': 'FontStyleSetter',
    },
    'style.margin': {
      'x-component': 'BoxStyleSetter',
    },
    'style.padding': {
      'x-component': 'BoxStyleSetter',
    },
    'style.borderRadius': {
      'x-component': 'BorderRadiusStyleSetter',
    },
    'style.border': {
      'x-component': 'BorderStyleSetter',
    },
    'style.opacity': {
      'x-decorator': 'FormItem',
      'x-component': 'Slider',
      'x-component-props': {
        defaultValue: 1,
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
  },
}
