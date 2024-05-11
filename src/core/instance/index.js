/*
 * @Description: 
 * @Autor: zengbotao@myhexin.com
 * @Date: 2022-05-02 17:47:22
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-11 19:12:40
 */
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)  
  // 第一步，找到_init是什么时候注入进去的prototype._init=>initMixin
}

// 初始化并扩展vue函数
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)


// vue最核心的概念
export default Vue
