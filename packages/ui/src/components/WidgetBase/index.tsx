import React from 'react'
import { View } from '@tarojs/components'

import { typePropsBase } from '../type'

type typeProps = typePropsBase &
  Partial<{
    eventsConfig
  }>

export const WidgetBase = ({ children, eventsConfig, ...props }: typeProps) => {
  return (
    <View
      {...props}
      onClick={(e) => {
        e?.preventDefault()
        eventsConfig?.scriptClick?.()
      }}
    >
      {children}
    </View>
  )
}
