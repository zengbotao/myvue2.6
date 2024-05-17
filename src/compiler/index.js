/*
 * @Description: 
 * @Autor: zengbotao@myhexin.com
 * @Date: 2022-05-02 17:47:22
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-17 19:38:01
 */
/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.

// console.log('createCompilerCreator',createCompilerCreator);
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {

  // Convert HTML string to AST.
  const ast = parse(template.trim(), options)
console.log(options.optimize,options);


  if (options.optimize !== false) {
    optimize(ast, options)
    console.log(ast,options,'optimize(ast, options)');
  //  ast {
  //     "type": 1,
  //     "tag": "div",
  //     "attrsList": [],
  //     "attrsMap": {},
  //     "rawAttrsMap": {},
  //     "children": [
  //         {
  //             "type": 2,
  //             "expression": "_s(message)",
  //             "tokens": [
  //                 {
  //                     "@binding": "message"
  //                 }
  //             ],
  //             "text": "{{message}}",
  //             "start": 5,
  //             "end": 16,
  //             "static": false
  //         }
  //     ],
  //     "start": 0,
  //     "end": 22,
  //     "plain": true,
  //     "static": false,
  //     "staticRoot": false
  // }
  }


  //options.render的由来
  const code = generate(ast, options)


  console.log(code,'code','generate(ast, options)');
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
