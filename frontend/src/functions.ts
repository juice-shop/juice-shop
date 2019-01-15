export function pressEnterHandler (loginForm, loginFunc, isEnabled) {
  document.getElementById(loginForm)
    .addEventListener('keyup', function (event) {
      event.preventDefault()
      if (event.keyCode === 13 && !isEnabled()) {
        loginFunc()
      }
    })
}
