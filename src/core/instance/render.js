/*
 * @Description: 
 * @Autor: zengbotao@myhexin.com
 * @Date: 2022-05-02 17:47:22
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-11 19:46:37
 */
/* @flow */

import {
  warn,
  nextTick,
  emptyObject,
  handleError,
  defineReactive
} from '../util/index'

import { createElement } from '../vdom/create-element'
import { installRenderHelpers } from './render-helpers/index'
import { resolveSlots } from './render-helpers/resolve-slots'
import { normalizeScopedSlots } from '../vdom/helpers/normalize-scoped-slots'
import VNode, { createEmptyVNode } from '../vdom/vnode'

import { isUpdatingChildComponent } from './lifecycle'

// 初始化渲染函数
export function initRender (vm: Component) {
  // _vnode 用于存储根节点的子树，初始值为 null
  vm._vnode = null 
  
  // _staticTrees 用于存储缓存的树，初始值为 null
  vm._staticTrees = null 
  
  // 获取组件的选项
  const options = vm.$options
  
  // 获取父级的虚拟节点作为占位符节点在父级树中
  const parentVnode = vm.$vnode = options._parentVnode 
  
  // 获取渲染上下文
  const renderContext = parentVnode && parentVnode.context
  
  // 解析插槽
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  
  // $scopedSlots 用于存储作用域插槽，初始值为空对象
  vm.$scopedSlots = emptyObject
  
  // 将 createElement 函数绑定到当前实例，以便我们可以在其中获得正确的渲染上下文
  // args 顺序：标签，数据，子节点，规范类型，总是进行规范化
  // 内部版本用于从模板编译成的渲染函数
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  
  // 规范化始终应用于公共版本，用于用户编写的渲染函数
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
  
  // $attrs & $listeners 暴露出来以便于更容易地创建高阶组件。
  // 它们需要是响应式的，这样HOCs使用它们就能保持最新状态
  const parentData = parentVnode && parentVnode.data
  
  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$attrs 是只读的。`, vm)
    }, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$listeners 是只读的。`, vm)
    }, true)
  } else {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
  }
}


export let currentRenderingInstance: Component | null = null

// for testing only
export function setCurrentRenderingInstance (vm: Component) {
  currentRenderingInstance = vm
}

export function renderMixin (Vue: Class<Component>) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype)

  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }
  // 1.3Vue 的 _render 方法是实例的一个私有方法，它用来把实例渲染成一个虚拟 Node。它的定义在 src/core/instance/render.js 文件中：
  // 在src/core/instance/init.js中，执行renderMixin，注入到到Vue.prototype上：
  Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      )
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      currentRenderingInstance = vm


      // 1.3render 函数中的 createElement 方法就是 vm.$createElement 方法，
      // 其中vm.$createElement的方法是在initRender中定义的，其中vm.$createElement调用了createElement，另一个方法也调用了，
      // 这个方法是被模板编译成的 render 函数使用，而 vm.$createElement 是用户手写 render 方法使用的， 
      // 这俩个方法支持的参数相同，并且内部都调用了 createElement 方法
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      handleError(e, vm, `render`)
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production' && vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
        } catch (e) {
          handleError(e, vm, `renderError`)
          vnode = vm._vnode
        }
      } else {
        vnode = vm._vnode
      }
    } finally {
      currentRenderingInstance = null
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0]
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      vnode = createEmptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
  }
}
