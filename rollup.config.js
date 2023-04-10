// 解析ts 插件
import ts from 'rollup-plugin-typescript2'
// 解下json的插件
import json from '@rollup/plugin-json'
// 解析第三方插件
import resolvePlugin from '@rollup/plugin-node-resolve'
// 创建 require 的方法
import { createRequire } from 'node:module'
// 获取更目录的
import { fileURLToPath } from 'node:url'
// 获取path 方法
import path from 'node:path'
const require = createRequire(
    import.meta.url)
const __dirname = fileURLToPath(new URL('.',
    import.meta.url))

//  获取文件路径
const packagesDir = path.resolve(__dirname, 'packages')
    //  获取需要打包的包
const packageDir = path.resolve(packagesDir, process.env.TARGET)


//  获取每个包的配置
const resolve = p => path.resolve(packageDir, p)
    // 获取每个包的 package.json
const pkg = require(resolve(`package.json`))
    //  取出包名
const name = path.basename(packageDir)
    //  创建格式对应表
const outputOpions = {
    "esm-bundler": {
        file: resolve(`dist/${name}.esm-bundler.js`),
        format: "es"
    },
    "cjs": {
        file: resolve(`dist/${name}.cjs.js`),
        format: "cjs"
    },
    "global": {
        file: resolve(`dist/${name}.global.js`),
        format: "iife"
    },

}

//  获取每个包下面设定的buildOptions格式
const options = pkg.buildOptions

// 设置打包函数
function createConfig(format, output) {
    //  进行打包
    output.name = options.name
    output.sourcemap = true
        //  生成rollup配置
    return {
        input: resolve("src/index.ts"), //导入
        // 打包配置
        output,
        // 这里是插件的调用
        Plugin: [
            json(),
            ts({
                tsconfig: path.resolve(__dirname, 'tsconfig.json')
            }),
            resolvePlugin()
        ]
    }
}
//  注意打包结束的时候一定要retun对象
export default options.formats.map(format => createConfig(format, outputOpions[format]))