import React from 'react'
import { observer, useForm } from '@formily/react'
import { Cell, CellProps } from '@nutui/nutui-react-taro'

import { typePropsBase } from '../type'

type typeProps = typePropsBase & CellProps &
  Partial<{
    eventsConfig
  }>

export const WidgetCell = observer(
  ({
    children,
    eventsConfig,
    ...props
  }: typeProps) => {
    return (
      <Cell
        {...props}
        onClick={(e) => {
          e?.preventDefault()
          eventsConfig?.scriptClick?.()
        }}
      >
        {children}
      </Cell>
    )
  }
)
