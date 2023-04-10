//  编辑打包设置文件 monerepo
// node 内置文件读写方法
import { execa } from "execa"
const build = async(pkg) => {
        //  -cw 监听 相当于热跟新
        await execa('rollup', ['-cw', '--environment', `TARGET:${pkg}`], { stdio: 'inherit' })
    }
    //  打包函数
build("reactivity")