/**
 * 在上一份代码中,虽然解决了副作用函数名称问题和数据绑定问题，但是仍存在一些问题
 * 因为分支切换可能会产生遗留的副作用函数
 *  解决目标: 分支切换中 不会保留遗留的副作用函数，
 *  解决办法: 重新设计副作用函数
 */

// 首先使用一个全局变量存储被注册的副作用函数
let activeEffect
// effect函数 用于注册副作用函数（改动）
function effect(fn) {
  const effectFn = () => {
    // 调用cleanup函数完成清楚工作
    cleanup(effectFn) // 新增
    // 当effectFn执行时，将其设置为当前激活的副作用函数
    activeEffect = effectFn
    fn()
  }
  // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
  effectFn.deps = []

  // 执行副作用函数
  effectFn()
}

// 使用WeakMap代替Set
const bucket = new WeakMap()
// 原始数据
const data = { text: 'hello world', ok: true }
// 2.为原始数据进行Proxy代理
const obj = new Proxy(data, {
  // 3.当读取操作时，触发get函数，拦截读取操作
  get(target, key) {
    // 将副作用函数 activeEffect添加到存储副作用函数的桶中
    track(target, key)
    // 返回属性值
    return target[key]
  },
  // 4.拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal
    // 把副作用函数从桶里取出并执行
    trigger(target, key)
  },
})

effect(() => {
  console.log(1)
  document.body.innerHTML = obj.ok ? obj.text : 'hello ...'
})

setTimeout(() => {
  obj.text = 'hello vue3'
}, 2000)

// 在get拦截函数内调用 track 函数追踪变化
function track(target, key) {
  // activeEffect
  if (!activeEffect) return target[key]
  // 根据target从容器中取得depsMap，它也是一个Map类型：key -> effects
  let depsMap = bucket.get(target)
  // 如果不存在depsMap，那么重新新建一个Map并于target关联
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  // 再根据key从depsMap中取得deps，它是一个Set类型
  // 里面存储着所有与当前key相关联的副作用函数：effects
  let deps = depsMap.get(key)
  // 如果不存在，同样新建一个Set并与key关联
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  // 最后将当前激活的副作用函数添加到容器里
  deps.add(activeEffect)
  console.log('track', deps)
  // deps就是一个与当前副作用函数存在联系的依赖集合
  // 将其添加到activeEffect.deps 数组中
  activeEffect.deps.push(deps) // 新增
}

// 在set拦截函数内调用trigger函数触发变化
function trigger(target, key) {
  // 根据target从容器中取得depsMap
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  // 新增
  const effectsToRun = new Set(effects)
  effectsToRun.forEach((effect) => {
    effect()
  })
  // 删除
  // deps &&
  //   deps.forEach((effect) => {
  //     effect()
  //   })
}

function cleanup(effectFn) {
  // 遍历 effectFn.deps数组
  // console.log(effectFn)
  for (let i = 0; i < effectFn.deps.length; i++) {
    // deps 是依赖集合
    const deps = effectFn.deps[i]
    console.log(deps)
    // 将effectFn从依赖集合中移除
    deps.delete(effectFn)
  }

  // 最后需要重置 effectFn.deps数组
  effectFn.deps.length = 0
}
