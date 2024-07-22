let funcName = new URLSearchParams(window.location.search).get('a')
// ruleid:detect-eval-with-expression
var x = new Function(`return ${funcName}(a,b)`)
