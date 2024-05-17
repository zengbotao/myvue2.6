/*
 * @Description: 
 * @Autor: zengbotao@myhexin.com
 * @Date: 2024-05-17 18:44:58
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-17 19:01:05
 */
import Vue from "../../dist/vue.esm.browser.js"

const app = new Vue({
  el: '#app',
  template:'<div>{{message}}</div>',
  data: {
    message: 'Hello Vue!'
  }
})
console.log(app);