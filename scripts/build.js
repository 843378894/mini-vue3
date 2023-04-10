//  编辑打包设置文件 monerepo
// node 内置文件读写方法
import fs from "fs"
import { execa } from "execa"

//  fs.readdirSync 读取对应文件夹下面的目录
const dirs = fs.readdirSync("packages").filter((p) => {
        // 对应路径下的文件是否是文件夹
        if (!fs.statSync(`packages/${p}`).isDirectory()) {
            return false
        }
        return true
    })
    // 对所有的文件进行遍历并行执行打包动作
const runParallel = (targets, buildFn) => {
        const res = []
        for (const target of targets) {
            res.push(buildFn(target))
        }
        return Promise.all(res)
    }
    // 打包核心调用execa执行 rollup 配置打包
const build = async(pkg) => {
        await execa('rollup', ['-cw', '--environment', `TARGET:${pkg}`], { stdio: 'inherit' })
    }
    // 调用打包函数
runParallel(dirs, build)