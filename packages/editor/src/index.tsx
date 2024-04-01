import React from 'react'
import { findDOMNode, render, unstable_batchedUpdates } from 'react-dom'
import ReactDOM, { createRoot } from 'react-dom/client'
import { defineCustomElements } from '@tarojs/components/dist/esm/loader.js'
import { createReactApp } from '@tarojs/plugin-framework-react/dist/runtime'
import { createH5NativeComponentConfig } from '@tarojs/plugin-framework-react/dist/runtime'

import App from './app'

// Taro H5 初始化
Object.assign(ReactDOM, { findDOMNode, render, unstable_batchedUpdates })
defineCustomElements(window)
const appObj = createReactApp(App, React, ReactDOM, {
  appId: 'root'
})
createH5NativeComponentConfig(null, React, ReactDOM)
appObj.onLaunch()


// const container = document.getElementById('root')
// if (container) {
//   const root = createRoot(container)
//   root.render(<App />)
// } else {
//   console.error('dom root is non-existent')
// }

