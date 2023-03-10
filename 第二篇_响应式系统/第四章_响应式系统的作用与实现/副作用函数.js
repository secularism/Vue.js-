// 副作用函数是指会产生副作用的函数
/**
 * 当effect函数执行时，它会设置body的文本内容，但除了effect函数之外的任何函数都可以读取或设置body的文本内容
 * 也就是说，effect函数的执行会直接或间接影响其他函数的执行，这时候就可以说effect函数产生了副作用
 */
function effect() {
  document.body.innerHTML = 'hello vue3'
}

// 副作用函数很容易产生，例如一个函数修改了全局变量，这也是一个副作用
let val = 1
function effect_() {
  val = 2
}
// map 和weakMap区别 weakMap 弱引用，不影响垃圾回收器的工作，所以表达式执行完毕，垃圾回收器就会把对象bar从内存中移除
const map = new Map()
const weakMap = new WeakMap()
;(function () {
  const foo = { foo: 1 }
  const bar = { bar: 2 }

  map.set(foo, 1)
  weakMap.set(bar, 2)
})()
// Map(1) { { foo: 1 } => 1 }
console.log(map)
// 打印为WeakMap { <items unknown> }
console.log(weakMap)

// 因此在设计容器时，需要使用weakMap 因为如果目标对象没有任何引用了，那就说明用户侧不再需要它
// 相反 如果使用Map，即使没有对他进行任何引用，这个target也不会回收，最终可能造成内存溢出
