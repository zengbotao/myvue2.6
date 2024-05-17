/*
 * @Description: 
 * @Autor: zengbotao@myhexin.com
 * @Date: 2022-05-02 17:47:22
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-05-17 19:40:38
 */
/* @flow */

import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'

// baseOptions:
// expectHTML: true,
// modules,
// directives,
// isPreTag,
// isUnaryTag,
// mustUseProp,
// canBeLeftOpenTag,
// isReservedTag,
// getTagNamespace,
// staticKeys: genStaticKeys(modules)

console.log('baseOptions:',baseOptions);
const { compile, compileToFunctions } = createCompiler(baseOptions)

console.log(compile,'compile, compileToFunctions', compileToFunctions);
export { compile, compileToFunctions }
