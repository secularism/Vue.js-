/**
 * 在上一份代码中,设计了一个简单的响应式数据的实现,但是还存在一些处理的问题
 * 1. 硬编码了副作用函数的名称,一旦函数名称不是effect.则代码不能正确运行
 *  解决目标: 希望副作用函数就算是匿名函数,也能被正确的加入到容器中
 *  解决办法: 提供一个用来注册副作用函数的机制
 * 2.原代码中，副作用函数和该对象数据绑定，
 * 但没有和被操作的目标字段之间建立明确的联系（也就是说，在副作用函数外部读取字段不存在的属性时，副作用函数仍然会被执行）
 *  解决目标：希望读取哪一个目标字段，相对应的目标函数才会执行
 *  解决方法：重新设定容器的数据结构
 */
// 首先使用一个全局变量存储被注册的副作用函数
let activateEffect
// effect函数 用于注册副作用函数
function effect(fn) {
  // 将函数赋值给activateEffect,这样容器不依赖副作用函数
  activateEffect = fn
  fn()
}

// 使用WeakMap代替Set
const bucket = new WeakMap()
// 原始数据
const data = { text: 'hello world', age: 18 }
// 2.为原始数据进行Proxy代理
const obj = new Proxy(data, {
  // 3.当读取操作时，触发get函数，拦截读取操作
  get(target, key) {
    // 没有activateEffect，直接return
    if (!activateEffect) return target[key]
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
    deps.add(activateEffect)

    // 返回属性值
    return target[key]
  },
  // 4.拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal
    // 根据target从容器中取得depsMap
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const deps = depsMap.get(key)
    deps &&
      deps.forEach((effect) => {
        effect()
      })
  },
})

effect(() => {
  console.log('1')
  document.body.innerHTML = obj.text
})

setTimeout(() => {
  obj.text = 'hello vue3'
}, 2000)
