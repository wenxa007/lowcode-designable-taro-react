import {
  registerValidateLocale,
  registerValidateRules,
  setValidateLanguage,
} from '@formily/core'
import { Schema } from '@formily/json-schema'
import { miniCompiler } from 'ui-nutui-react-taro'

export function initFormily() {
  if (process.env.TARO_ENV !== 'h5') {
    // json-schema注册兼容小程序的解析器
    Schema.registerCompiler(miniCompiler)
  } else {
    // json-schema注册兼容小程序的解析器 在h5环境中测试
    // Schema.registerCompiler(miniCompiler)
  }

  // 组件初始化

  // 校验文案初始化
  registerValidateRules({
    noBr(value) {
      return value.includes('\n') ? '不支持换行' : ''
    },
  })

  // 国际化初始化
  setValidateLanguage('zh-CN')
  registerValidateLocale({
    'zh-CN': {
      // required: '定制的必填校验文案',
    },
  })
}
