import React, { ReactNode } from 'react'
import { IconFont } from '@nutui/icons-react-taro'
import { Image } from '@nutui/nutui-react-taro'
import { ImageProps } from '@nutui/nutui-react-taro/dist/types/index'
import * as lodash from 'lodash-es'

import { transitionToPx } from '../utils'

export type typeIconImageProps = Partial<{
  iconFontProps: Parameters<typeof IconFont>[0] & { iconName: string }
  imageProps: ImageProps
}>

export function getIconImageConfig(
  names: string[],
  record: Record<string, typeIconImageProps | undefined>,
) {
  const IconImageConfig: Record<string, ReactNode> = {}
  names.forEach((name) => {
    if (record[name]?.imageProps?.src) {
      const props = record[name]!.imageProps!
      if (!process.env.EDITOR) {
        transitionToPx(props.style)
        transitionToPx(props, '', ['width', 'height', 'radius'])
      }
      IconImageConfig[name] = <Image {...props}></Image>
    } else if (record[name]?.iconFontProps?.iconName) {
      const props = record[name]!.iconFontProps!
      if (!process.env.EDITOR) {
        transitionToPx(props.style)
        transitionToPx(props, '', ['width', 'height', 'size'])
      }
      const { iconName, ...otherProps } = props
      IconImageConfig[name] = (
        <IconFont {...otherProps} name={props.iconName}></IconFont>
      )
    }
  })

  return IconImageConfig
}

export function getIconImagePropsRecord(
  props: { [x: string]: any },
  propNames: string[],
) {
  return propNames.reduce<Record<string, typeIconImageProps>>(
    (record, name: string) => {
      record[name] = props[name]
      return record
    },
    {},
  )
}
