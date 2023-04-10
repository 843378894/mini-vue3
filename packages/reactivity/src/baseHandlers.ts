import { hasOwn, isArray, isIntegerKey, isObject,hasChange } from "@vue/shared"
import { reactive, readonly } from "./reactive"
import{TrackOpTypes ,TriggerOpTypes}from'./operations'
import {track,trigger} from'./effect'

/**
 * 该文件写的是代理的捕获配置对象不了解的话看一下ES6的Proxy ;new Proxy(target,{get:function,set:function,delete:function})
 * @description 注意这里是对象不是方法 
 * 
 * 
 */
const get = /*#__PURE__*/ createGetter()
const shallowGet = /*#__PURE__*/ createGetter(false, true)
const readonlyGet = /*#__PURE__*/ createGetter(true)
const shallowReadonlyGet = /*#__PURE__*/ createGetter(true, true)

const set = /*#__PURE__*/ createSetter()
const shallowSet =/*#__PURE__*/ createSetter(true)

//  代理中的set函数
function createSetter(shallow=false){
    return function set(target,key,value,receiver){
       
        // 判断是数组还是对 是添加值还是修改
        const oldValue = target[key]
        // 判断 是不是数组 值是不是正数 是不是新增 或者 对象的值有没有
        let haskey = isArray(target) && isIntegerKey(key) ? Number(key) <target.length :hasOwn(target,key)
        // 通过映射拿到新的值
        const result = Reflect.set(target,key,value,receiver)
        // 没有对应的值 新增   
        if(!haskey){
                trigger(target,TriggerOpTypes.ADD,key,value)
            }else{
                // 有对应的值就是修改 ，修改的时候要判断是否一致。新值老值
                if(!hasChange(value,oldValue)){
                    // 不一致的时候修改传入新值 value 老值 oldValue
                    trigger(target,TriggerOpTypes.SET,key,value,oldValue)
                }
            }
       
        return result
    }
}

function createGetter(isReadonly=false,shallow=false){
    return function get(target,key,receiver){
        // Reflect.get 相当于target[key] 好处是这个方法不会直接操作原对象{a:{b:{}}} res = {b:{}}
        const res = Reflect.get(target,key,receiver)
        if(!isReadonly){
            // 不是只读操作 要做依赖收集
            track(target,TrackOpTypes.GET,key)
        }

        if(shallow){
            //  浅层代理直接返回 之前在reactve中已经代理过一次了
            return res
        }

        if(isObject(res)){
            // 这里判断那到的value还是对象 我们在外面使用了 target.a 会触发get 方法走进createGetter 现在的res = {b:{}}
            // 递归调用代理方法
            // 遇到的面试题:为什么使用proxy性能根据好，因为Objeact.definepropty 上来就是递归处理，proxy是懒代理只有在调用的时候才会去递归代理
            return isReadonly ? readonly(res) : reactive(res)

        }
        return res
    }

}

export const reactiveHandlers ={
    get,
    set
    
}
export const shallowReactiveHandlers ={
    get:shallowGet,
    set:shallowSet
    
}
export const readonlyHandlers ={
    get:readonlyGet,
    set(target, key) {
        // readonly 的响应式对象不可以修改值
        console.warn(
          `Set operation on key "${String(key)}" failed: target is readonly.`,
          target
        );
        return true;
      },

}
export const shallowReadonlyHandlers ={
    get:shallowReadonlyGet,
    set(target, key) {
        // readonly 的响应式对象不可以修改值
        console.warn(
          `Set operation on key "${String(key)}" failed: target is readonly.`,
          target
        );
        return true;
      },
}