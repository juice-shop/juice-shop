export function pressEnterHandler (form, submitAction, isEnabled) {
  document.getElementById(form)
    .addEventListener('keyup', function (event) {
      event.preventDefault()
      if (event.keyCode === 13 && isEnabled()) {
        submitAction()
      }
    })
}
