/**
 * 将数据变成响应式数据其实根据两条线索即可
 * 1.当副作用函数执行时，触发obj.text的读取操作
 * 2.当修改obj.text的值时，会触发obj.text的设置操作
 * 如此，如果能够拦截设置和读取操作，则在读取操作时，存储副作用函数，当触发设置操作之后再执行副作用函数即可
 */

// 设计思路: 使用Proxy作为数据代理来实现
// 1.设置一个容器存储副作用函数
const bucket = new Set()
// 原始数据
const data = { text: 'hello world', age: 18 }
// 为原始数据进行Proxy代理
const obj = new Proxy(data, {
  // 当读取操作时，触发get函数，拦截读取操作
  get(target, key) {
    /**
     * target 是拦截的目标对象，这里是data
     * key是 对象的属性，effect函数读取的是obj的text属性，因此这里key是text
     */
    // 将副作用函数存放于容器中，便于拦截设置时调用
    bucket.add(effect)
    // 最后将该值返回
    return target[key]
  },
  // 拦截设置操作
  set(target, key, newVal) {
    // newVal是需要设置的新值: hello vue3
    // 将新值赋值给该对象的属性中
    target[key] = newVal
    // 执行副作用函数将body的值进行修改
    bucket.forEach((fn) => fn())
    // 返回true代表成功
    return false
  },
})

function effect() {
  document.body.innerText = obj.text
}

effect()

setTimeout(() => {
  obj.text = 'hello vue3'
}, 2000)
