/* @flow */
//entry-runtime-with-compiler vue的核心入口，它比entry-runtime多了compiler
import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
// initMixin(Vue) 
// stateMixin(Vue)
// eventsMixin(Vue)
// lifecycleMixin(Vue)
// renderMixin(Vue)初始化好了render方法，在下面消费
// Vue 的 _render 方法是实例的一个私有方法，它用来把实例渲染成一个虚拟 Node。它的定义在 src/core/instance/render.js 文件中：
// 在src/core/instance/init.js中，执行renderMixin，注入到到Vue.prototype上

import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})


// new Vue({
//   router,
//   render: (h) => h(App)
// }).$mount('#app')

// 1.2在初始化的最后，检测到如果有 el 属性，则调用 vm.$mount 方法挂载 vm，挂载的目标就是把模板渲染成最终的 DOM，那么接下来我们来分析 Vue 的挂载过程。
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 1.2$mount 方法支持传入 2 个参数，第一个是 el，它表示挂载的元素，可以是字符串，也可以是 DOM 对象，
  // 如果是字符串在浏览器环境下会调用 query 方法转换成 DOM 对象的。
  // 第二个参数是和服务端渲染相关，在浏览器环境下我们不需要传第二个参数。
  el = el && query(el)

  /* istanbul ignore if 1. 它对 el 做了限制，Vue 不能挂载在 body、html 这样的根节点上；*/
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // 1.2. 如果没有定义 render 方法，则会把 el 或者 template 字符串转换成 render 方法。
  // 在 Vue 2.0 版本中，所有 Vue 的组件的渲染最终都需要 render 方法，无论我们是用单文件 .vue 方式开发组件，
  // 还是写了 el 或者 template 属性，最终都会转换成 render 方法；
  if (!options.render) { //在src/core/instance/init.js中，执行renderMixin，注入render到Vue.prototype上：
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)//没有写，额外生成一个div
    }



    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      //render在不同场景下的定义，通过函数生成
      // 1.2. 根据生成的template函数，会执行在线编译的过程，是调用 compileToFunctions 方法实现的，在后续的编译过程中讲解。最后，调用原先原型上的 $mount 方法挂载；
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)//this就是vue实例，el：要挂载的元素‘#app’
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
