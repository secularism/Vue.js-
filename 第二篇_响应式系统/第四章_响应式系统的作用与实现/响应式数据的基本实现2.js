/**
 * 在上一份代码中,设计了一个简单的响应式数据的实现,但是还存在一些处理的问题
 * 1. 硬编码了副作用函数的名称,一旦函数名称不是effect.则代码不能正确运行
 *  解决目标: 希望副作用函数就算是匿名函数,也能被正确的加入到容器中
 *  解决办法: 提供一个用来注册副作用函数的机制
 * 2.
 */
// 首先使用一个全局变量存储被注册的副作用函数
let activateEffect
// effect函数 用于注册副作用函数
function effect(fn) {
  // 将函数赋值给activateEffect,这样容器不依赖副作用函数
  activateEffect = fn
  fn()
}

// 1.设置一个容器存储副作用函数
const bucket = new Set()
// 原始数据
const data = { text: 'hello world', age: 18 }
// 2.为原始数据进行Proxy代理
const obj = new Proxy(data, {
  // 3.当读取操作时，触发get函数，拦截读取操作
  get(target, key) {
    // 如果activateEffect有值,代表effect函数被执行
    if (activateEffect) {
      // 收集activateEffect
      bucket.add(activateEffect)
    }
    // 最后将该值返回
    return target[key]
  },
  // 4.拦截设置操作
  set(target, key, newVal) {
    // 将新值赋值给该对象的属性中
    target[key] = newVal
    // 执行副作用函数将body的值进行修改
    bucket.forEach((fn) => fn())
    // 返回true代表成功
    return false
  },
})

effect(() => {
  console.log('1')
  document.body.innerHTML = obj.text
})

setTimeout(() => {
  obj.no = 'hello vue3'
}, 2000)
