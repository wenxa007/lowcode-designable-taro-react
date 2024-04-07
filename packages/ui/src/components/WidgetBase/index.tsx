import React from 'react'
import { View } from '@tarojs/components'

import { typePropsBase } from '../type'
import { formilyStoreEvent, useScope } from '../utils'

type typeProps = typePropsBase &
  Partial<{
    eventsConfig
  }>

export const WidgetBase = ({ children, eventsConfig, ...props }: typeProps) => {
  const scope = useScope()
  return (
    <View
      {...props}
      onClick={(e) => {
        if (eventsConfig?.scriptClick) {
          formilyStoreEvent(scope, eventsConfig.scriptClick)
        }
      }}
    >
      {children}
    </View>
  )
}
