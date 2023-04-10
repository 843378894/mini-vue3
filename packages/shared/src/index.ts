

export function isObject(target){
    return typeof target ==='object' && target != null
}

export const isFunction =(val)=> typeof val === 'function'
export const isNumber =(val)=> typeof val === 'number'
export const isString =(val)=> typeof val === 'string'
export const isArray =Array.isArray
export const isIntegerKey =(key)=> parseInt(key) + '' === key
const hasOwnProperty =Object.prototype.hasOwnProperty
export const hasOwn =(target,key)=>hasOwnProperty.call(target,key)
export const hasChange = (value,oldValue) => value ! == oldValue