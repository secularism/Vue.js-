/**
 * 在上一份代码中,设计了一个简单的响应式数据的实现,但是还存在一些处理的问题
 */
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
