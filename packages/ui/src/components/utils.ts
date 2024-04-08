import { useField } from '@formily/react'
import { autorun, observable, untracked } from '@formily/reactive'
import vm from '@kimeng/vm/src/vm'
import Taro from '@tarojs/taro'
import * as lodash from 'lodash-es'

import ArrayBase from './ArrayBase'

// --- 小工具 start
// lodash.throttle 在小程序里不能正常获得时间
export function throttle(callback, wait = 600) {
  let start = 0
  return function (...args) {
    const now = new Date().getTime()
    if (now - start >= wait) {
      callback.call(this, ...args)
      start = now
    }
  }
}
// --- 小工具 end

// --- 样式转化相关 start
type transitionToPxMode = 'rpx' | 'rem'
const pxToRem = (str) => {
  const reg = /(\d+(\.\d*)?)+(px)/gi
  return String(str).replace(reg, function (x) {
    const val = x.replace(/px/gi, '')
    return Taro.pxTransform(Number(val))
  })
}
export function transitionToPx(
  origin,
  mode?: transitionToPxMode | '',
  keys?: string[],
) {
  if (!mode) {
    if (process.env.TARO_ENV === 'h5') {
      mode = 'rem'
    } else {
      mode = 'rpx'
    }
  }
  const transitionKeys = Array.isArray(keys) ? keys : Object.keys(origin)
  transitionKeys.forEach((s) => {
    if (typeof origin[s] === 'string') {
      if (mode === 'rem') {
        origin[s] = pxToRem(origin[s])
      } else {
        origin[s] = String(origin[s]).replace(/px/g, 'rpx')
      }
    }
  })
}
export function schemaTransitionPx(
  theSchema,
  options?: { mode: transitionToPxMode },
) {
  // 处理designable导出的json中schema字段的style 从px转成rem或rpx
  if (theSchema.hasTransition) {
    return
  }
  for (const i in theSchema.properties) {
    const componentOptions = theSchema.properties[i]
    const style = componentOptions?.['x-component-props']?.style
    if (style) {
      transitionToPx(style, options?.mode)
      // 如果有背景图片 backgroundSize 默认为 cover
      if (style.backgroundImage && !style.backgroundSize) {
        style.backgroundSize = 'cover'
      }
    }
    if (componentOptions.properties) {
      schemaTransitionPx(componentOptions)
    }

    // 遍历 Array类型字段
    if (componentOptions?.items?.properties) {
      schemaTransitionPx(componentOptions.items)
    }
  }

  theSchema.hasTransition = true
}
export function formStyleTransitionPx(
  form,
  options?: { mode: transitionToPxMode },
) {
  // 处理designable导出的json中form字段的style 从px转成rem或rpx
  if (form.hasTransition) {
    return
  }
  const style = form.style || {}
  if (style) {
    transitionToPx(style, options?.mode)
    if (style.backgroundImage && !style.backgroundSize) {
      style.backgroundSize = 'cover'
    }
  }
  form.hasTransition = true
}
// --- 样式转化相关 end

// --- Schema中JS表达式执行相关 start
// export function baseCompiler(expression, scope, isStatement?) {
//   if (isStatement) {
//     new Function('$root', 'with($root) { '.concat(expression, '; }'))(scope)
//     return
//   }
//   return new Function(
//     '$root',
//     'with($root) { return ('.concat(expression, '); }'),
//   )(scope)
// }
export function miniCompiler(expression, scope, isStatement?) {
  if (scope === void 0) {
    scope = {}
  }
  const scopeKey = Object.keys(scope).filter((str) => str.includes('$'))
  scopeKey.forEach((key) => {
    const reg = new RegExp(`\\${key}`, 'g')
    expression = expression.replace(reg, 'scope.' + key)
  })
  const bridge = { current: null }
  const context = vm.createContext({ bridge, expression, scope, console })
  try {
    if (isStatement) {
      vm.runInContext(`${expression} `, context)
      return
    }
    vm.runInContext(`bridge.current = ${expression} `, context)
  } catch (err) {
    console.error(err)
  }
  return bridge.current
}
// --- Schema中JS表达式执行相关 end
