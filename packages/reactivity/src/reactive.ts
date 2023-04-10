
// shared 中写的是公共代码 需要先npm run build 打包才能引入，build报错的话先执行yarn install 再build 
import { isObject} from'@vue/shared'
import {reactiveHandlers,shallowReactiveHandlers,readonlyHandlers,shallowReadonlyHandlers} from './baseHandlers'


/**
 * vue3核心方法实现
 * reactive  创建响应式数据
 * shallowReactive 第一层的响应式
 * readonly 只读方法
 * readonly浅层的只读
 * 
 */
export function reactive(target){

    return createReactObj(target,false,reactiveHandlers)

}

export function shallowReactive(target){
    return createReactObj(target,false,shallowReactiveHandlers)
    
}

export function readonly(target){
    return createReactObj(target,true,readonlyHandlers)
    
}

export function shallowReadonly(target){
    return createReactObj(target,true,shallowReadonlyHandlers)
    
}
/**
 * weakMap  相当于Map 但是key是对象 而且有自动垃圾回收
 * 使用weakMap 储存代理了的target是性能优化，防止已经代理过的数据多次代理
 * 
 */
const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()



/**
 * 高阶函数根据入参处理不同的业务群相同业务又能共用
 * 
 * @description 代理核心方法
 * 
 * @target 目标对象，创建响应式传入的对象
 * 
 * @isReadonly 是否只读
 * 
 * @baseHandlers  代理捕获核心  相当于Objeact 的get set 等捕获设置
 */
function   createReactObj(target,isReadonly,baseHandlers){
    if(!isObject(target)){
        // 如果不是对象就直接返回 proxy只能代理对象
        return target
    }
// 根据是否只读来区分使用map集合储存
    const proxymap = isReadonly ? readonlyMap : reactiveMap
    // 取一下数据看集合中是否有该对象
    const proxyEs = proxymap.get(target)
    // 在集合中表明已经代理过了，直接返回
    if(proxyEs){
        return proxyEs
    }
    const proxy = new Proxy(target,baseHandlers)
    proxymap.set(target,proxy)
    return proxy
}