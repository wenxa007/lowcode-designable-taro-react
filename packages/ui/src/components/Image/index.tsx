import React from 'react'
import { connect, mapProps, mapReadPretty, useForm } from '@formily/react'
import { Image as Component } from '@nutui/nutui-react-taro'
import { ImageProps } from '@nutui/nutui-react-taro/dist/types/index'

import { typePropsFields } from '../type'
import { formilyStoreEvent, useScope } from '../utils'

type typeProps = typePropsFields &
  ImageProps &
  Partial<{
    useValue: boolean // 使用表单中对应字段的值
    eventsConfig
  }>

export const Image = connect(
  ({ useValue, value, src, eventsConfig, ...props }: typeProps) => {
    const srcHandled = (useValue ? value : src) || ''
    const scope = useScope()
    return (
      <Component
        src={srcHandled}
        {...props}
        onClick={(e) => {
          if (eventsConfig?.scriptClick) {
            formilyStoreEvent(scope, eventsConfig.scriptClick)
          }
        }}
      ></Component>
    )
  },
)
