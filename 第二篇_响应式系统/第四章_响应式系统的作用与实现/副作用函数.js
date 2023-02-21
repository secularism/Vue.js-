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
