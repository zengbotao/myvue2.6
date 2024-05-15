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
  // 1.1第一步，找到_init是什么时候注入进去的prototype._init=>initMixin
}

// 初始化并扩展vue函数
initMixin(Vue) 
//1.1=>    vm._self = vm
    // initLifecycle(vm)
    // initEvents(vm)
    // initRender(vm) 节点转化成h渲染的层级树   =>初始化$createElement 层级树转化成vnode _createElement (
                                                      //   context: Component,
                                                      //   tag?: string | Class<Component> | Function | Object,
                                                      //   data?: VNodeData,
                                                      //   children?: any,
                                                      //   normalizationType?: number
                                                      // ): VNode | Array<VNode> 

    // callHook(vm, 'beforeCreate')
    // initInjections(vm) // resolve injections before data/props
    // initState(vm)
    // initProvide(vm) // resolve provide after data/props
    // callHook(vm, 'created')

    // /* istanbul ignore if */
    // if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    //   vm._name = formatComponentName(vm, false)
    //   mark(endTag)
    //   measure(`vue ${vm._name} init`, startTag, endTag)
    // }

    // //1.1-》1.2如果有定义的根元素，则将Vue实例挂载到这个根元素上。
    // if (vm.$options.el) {
    //   vm.$mount(vm.$options.el)
    // }



stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)


// vue最核心的概念
export default Vue
