import React from 'react'
import { observer, useForm } from '@formily/react'
import { Popup, PopupProps } from '@nutui/nutui-react-taro'

import { typePropsBase } from '../type'

type typeProps = typePropsBase &
  PopupProps &
  Partial<{
    eventsConfig
  }>

export const WidgetPopup = ({
  children,
  eventsConfig,
  ...props
}: typeProps) => {
  return (
    <Popup
      {...props}
      onClick={(e) => {
        e?.preventDefault()
        eventsConfig?.scriptClick?.()
      }}
      onClose={() => {
        eventsConfig?.scriptClose?.()
      }}
    >
      {children}
    </Popup>
  )
}
