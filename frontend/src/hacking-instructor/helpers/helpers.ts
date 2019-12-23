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
      if (inputElement.value && inputElement.value !== '') {
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
    if (!element) {
      console.warn(`Could not find Element with selector "${elementSelector}"`)
    }

    await new Promise((resolve) => {
      element.addEventListener('click', () => resolve())
    })
  }
}

export function waitForElementsInnerHtmlToBe (elementSelector: string, value: String) {
  return async () => {
    while (true) {
      const element = document.querySelector(
        elementSelector
      ) as HTMLElement

      if (element && element.innerHTML === value) {
        break
      }
      await sleep(100)
    }
  }
}

export function waitInMs (timeInMs: number) {
  return () => sleep(timeInMs)
}

export function waitForAngularRouteToBeVisited (route: String) {
  return async () => {
    while (true) {
      if (window.location.hash === `#/${route}`) {
        break
      }
      await sleep(100)
    }
  }
}
