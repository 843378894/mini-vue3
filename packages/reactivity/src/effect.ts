import { isArray, isIntegerKey } from "@vue/shared";
import { TriggerOpTypes } from "./operations";

export function effect(fun, options: any = {}) {
  const effect = creatReactEffect(fun, options);
  // 不是懒执行 直接执行
  if (!options?.lazy) {
    effect();
  }
}
//  定义属性用作区分。每个属性都会有自己的uid
let uid = 0;
// 储存当前的effect
let activeEffect;
function creatReactEffect(fun, options) {
  const effect = function reactEffect() {
    activeEffect = effect;
    fun();
  };
  effect.id = uid++; //区分effect
  effect._isEffect = true; //区分effect 是不是响应式
  effect.raw = fun; //保存传进来的方法
  effect.options = options; //保存传进来的属性
  return effect;
}

// 收集依赖effect 在获取数据的时候触发get 收集effect
let targetMap = new WeakMap();
export function track(target, type, key) {
  // 是undefined则说明没有调用或者不是响应数据
  if (activeEffect === undefined) return;
  // 获取effect {target:dep}
  let depMap = targetMap.get(target);
  if (!depMap) {
    // 没有 depMap 说明第一次调用
    targetMap.set(target, (depMap = new Map()));
  }
  // 有depMap 就要判断有没有收集属性依赖
  let dep = depMap.get(key);
  if (!dep) {
    // 没有收集属性依赖就要添加
    depMap.set(key, (dep = new Set()));
  }
  // 有属性要看看依赖收集没有
  if (!dep.has(activeEffect)) {
    // 没有要添加
    dep.add(activeEffect);
  }
}

// 更新
export function trigger(target, type, key?, value?, oldValue?) {
  // 获取一下目标对象，有值那么说明目标对象有对应的依赖收集
  const depsMap = targetMap.get(target);
  // 没有对应的依赖收集就直接retun
  if (!depsMap) return;
  // 利用set集合特性防止有多个相同的改动重复执行
  let effectSet = new Set();
  const add = (effectAdd) => {
    if (effectAdd) {
      effectAdd.array.forEach((element) => {
        // 这里是去重
        effectSet.add(element);
      });
    }
  };

  // 对数组进行特殊处理
  if (key === "length" && isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (key === "length" || key > value) {
        // depsMap.get(key) 这里是拿到对应的目标对象下面的属性下面收集的依赖
        add(dep);
      }
    });
  } else {
    if (key != undefined) {
      // depsMap.get(key) 这里是拿到对应的目标对象下面的属性下面收集的依赖
      add(depsMap.get(key));
    }
    // 数组 修改 索引
    switch(type){
        case TriggerOpTypes.ADD:
            if(isArray(target) && isIntegerKey(key)){
                add(depsMap.get('length'))
            }
    }
  }
  // 执行对应的依赖
  effectSet.forEach((effect: any) => effect());
}
