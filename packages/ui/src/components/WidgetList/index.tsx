import React from 'react'
import { VirtualList, VirtualListProps } from '@nutui/nutui-react-taro'

import { typePropsBase } from '../type'
import { formilyStoreEvent, useScope } from '../utils'

type typeProps = typePropsBase &
  VirtualListProps &
  Partial<{
    eventsConfig
  }>

// TODO
export const WidgetList = ({ ...props }: typeProps) => {
  return <VirtualList {...props}></VirtualList>
}
