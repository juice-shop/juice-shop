function sleep (timeInMs: number): Promise<void> {
  return new Promise((resolved) => {
    setTimeout(resolved, timeInMs)
  })
}

export function waitForInputToHaveValue (inputSelector: string, value: string) {
  return async () => {
    const password = document.querySelector(
      inputSelector
    ) as HTMLInputElement

    while (true) {
      if (password.value === value) {
        break
      }
      await sleep(100)
    }
  }
}

export function waitForInputToNotHaveValue (inputSelector: string, value: string) {
  return async () => {
    const password = document.querySelector(
      inputSelector
    ) as HTMLInputElement

    while (true) {
      if (password.value !== value) {
        break
      }
      await sleep(100)
    }
  }
}

export function waitForElementToGetClicked (elementSelector: string) {
  return async () => {
    const element = document.querySelector(
      elementSelector
    ) as HTMLButtonElement

    await new Promise((resolve) => {
      element.addEventListener('click', () => resolve())
    })
  }
}
