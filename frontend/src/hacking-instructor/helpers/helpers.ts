export function sleep (timeInMs: number): Promise<void> {
  return new Promise((resolved) => {
    setTimeout(resolved, timeInMs)
  })
}

export function waitForInputToHaveValue (inputSelector: string, value: string, options = { ignoreCasings: true }) {
  return async () => {
    const password = document.querySelector(
      inputSelector
    ) as HTMLInputElement

    while (true) {
      if (password.value === value) {
        break
      } else if (options.ignoreCasings && password.value.toLowerCase() === value.toLowerCase()) {
        break
      }
      await sleep(100)
    }
  }
}

export function waitForInputToNotHaveValue (inputSelector: string, value: string, options = { ignoreCasings: true }) {
  return async () => {
    const password = document.querySelector(
      inputSelector
    ) as HTMLInputElement

    while (true) {
      if (password.value !== value) {
        break
      } else if (options.ignoreCasings && password.value.toLowerCase() === value.toLowerCase()) {
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
    )
    if (element === null) {
      console.warn(`Element with selector "${elementSelector}" is null`)
    }

    await new Promise((resolve) => {
      element.addEventListener('click', () => resolve())
    })
  }
}

/**
 * Returns a function that waits for the specified time in milli seconds
 */
export function waitInMs (timeInMs: number) {
  return () => sleep(timeInMs)
}
