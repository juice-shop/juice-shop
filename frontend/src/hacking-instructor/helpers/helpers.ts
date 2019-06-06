export function sleep (timeInMs: number): Promise<void> {
  return new Promise((resolved) => {
    setTimeout(resolved, timeInMs)
  })
}

export function waitForInputToHaveValue (inputSelector: string, value: string, options = { ignoreCase: true }) {
  return async () => {
    const inputElement = document.querySelector(
      inputSelector
    ) as HTMLInputElement

    while (true) {
      if (inputElement.value === value) {
        break
      } else if (options.ignoreCase && inputElement.value.toLowerCase() === value.toLowerCase()) {
        break
      }
      await sleep(100)
    }
  }
}

export function waitForInputToNotHaveValue (inputSelector: string, value: string, options = { ignoreCase: true }) {
  return async () => {
    const inputElement = document.querySelector(
      inputSelector
    ) as HTMLInputElement

    while (true) {
      if (inputElement.value !== value) {
        break
      } else if (options.ignoreCase && inputElement.value.toLowerCase() === value.toLowerCase()) {
        break
      }
      await sleep(100)
    }
  }
}

export function waitForInputToNotBeEmpty (inputSelector: string) {
  return async () => {
    const inputElement = document.querySelector(
      inputSelector
    ) as HTMLInputElement

    while (true) {
      if (inputElement.value !== undefined && inputElement.value !== null && inputElement.value !== '') {
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
    ) as HTMLElement
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
