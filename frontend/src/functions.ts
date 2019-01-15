export function pressEnterHandler (formId, submitButtonId, callback) {
  const submitButton = document.getElementById(submitButtonId) as HTMLInputElement
  document.getElementById(formId)
    .addEventListener('keyup', function (event) {
      event.preventDefault()
      if (event.keyCode === 13 && !submitButton.disabled) {
        callback()
      }
    })
}
