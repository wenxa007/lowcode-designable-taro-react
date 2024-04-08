import React from 'react'
import { connect, mapProps, mapReadPretty, useForm } from '@formily/react'
import { IconFont } from '@nutui/icons-react-taro'

import { typePropsFields } from '../type'

type typeProps = typePropsFields &
  Parameters<typeof IconFont>[0] &
  Partial<{
    useValue: boolean // 使用表单中对应字段的值
    iconName: string // 在设计器中填入的静态值
    useWidthAsSize: boolean // 使用宽度作为size
    eventsConfig
  }>

export const Icon = connect(
  ({ useValue, value, iconName, useWidthAsSize, eventsConfig, ...props }: typeProps) => {
    const nameHandled = (useValue ? value : iconName) || ''
    if (useWidthAsSize) {
      if (props.style?.width) {
        props.size = props.style.width
      }
    }
    return (
      <IconFont
        name={nameHandled}
        {...props}
        onClick={(e) => {
          e?.preventDefault()
          eventsConfig?.scriptClick?.()
        }}
      ></IconFont>
    )
  },
)
