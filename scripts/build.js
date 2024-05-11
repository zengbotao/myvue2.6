const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const rollup = require('rollup')

const terser = require('terser')
// terser 是一个用于压缩和丑化 JavaScript 代码的工具，它是 uglify-es 的分支，
// 用于支持 ES6+ 代码。在 npm 中，terser 通常用于构建过程中，以减小 JavaScript 文件的大小，提高网页加载速度。

// 作用
// 压缩代码：通过移除多余的空格、换行和注释，以及缩短变量名，来减小文件大小。
// 丑化代码：将代码中的变量名、函数名替换为更短的字符，使得代码更难以阅读和理解。
// 兼容性：支持最新的 JavaScript 语法，包括 ES6+。

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

let builds = require('./config').getAllBuilds()

// filter builds via command line arg
if (process.argv[2]) {
  const filters = process.argv[2].split(',')
  builds = builds.filter(b => {
    return filters.some(f => b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1)
  })
} else {
  // filter out weex builds by default
  builds = builds.filter(b => {
    return b.output.file.indexOf('weex') === -1
  })
}

build(builds)

function build (builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }

  next()
}

/**
 * 构建入口文件的方法
 * @param {Object} config - rollup配置对象，包含输出配置
 */
function buildEntry(config) {
  // 获取输出配置
  const output = config.output;
  
  // 从输出配置中解构出文件和banner信息
  const { file, banner } = output;
  
  // 判断当前是否为生产环境，通过正则表达式判断文件名是否包含“min”或“prod”
  const isProd = /(min|prod)\.js$/.test(file);
  
  // 使用rollup生成bundle，并根据输出配置生成bundle
  return rollup.rollup(config)
    .then(bundle => bundle.generate(output))
    .then(({ output: [{ code }] }) => {
      // 如果当前为生产环境
      if (isProd) {
        // 使用terser库对代码进行压缩，并添加banner信息
        const minified = (banner ? banner + '\n' : '') + terser.minify(code, {
          toplevel: true, // 将代码作为顶级脚本处理，适用于压缩立即执行的函数表达式（IIFE）
          output: {
            ascii_only: true, // 非ASCII字符将被转义
          },
          compress: {
            pure_funcs: ['makeMap'], // 在压缩过程中，移除纯函数（即没有副作用的函数）
          }
        }).code;
        
        // 将压缩后的代码写入文件，并指示该文件应以utf-8编码
        return write(file, minified, true);
      } else {
        // 如果当前为非生产环境，直接将代码写入文件，无需压缩
        return write(file, code);
      }
    });
}


function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }
    // 在文件系统中写入代码到指定的目的地*********
    fs.writeFile(dest, code, err => {
      // 如果在写入过程中发生错误，则返回一个拒绝的Promise
      // 这个Promise将包含错误对象作为参数
      if (err) return reject(err)
      
      // 如果zip为true，说明要压缩代码
      if (zip) {
        // 使用zlib.gzip对代码进行压缩
        zlib.gzip(code, (err, zipped) => {
          // 如果在压缩过程中发生错误，则返回一个拒绝的Promise
          // 这个Promise将包含错误对象作为参数
          if (err) return reject(err)
          
          // 报告压缩后的代码的大小
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        // 如果不进行压缩，则只进行正常的报告
        report()
      }
    })

  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
