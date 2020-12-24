/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

export async function sleep (timeInMs: number): Promise<void> {
  return await new Promise((resolved) => {
    setTimeout(resolved, timeInMs)
  })
}

export function waitForInputToHaveValue (inputSelector: string, value: string, options = { ignoreCase: true }) {
  return async () => {
    const inputElement = document.querySelector(
      inputSelector
    )

    while (true) {
      if (options.ignoreCase && inputElement.value.toLowerCase() === value.toLowerCase()) {
        break
      } else if (!options.ignoreCase && inputElement.value === value) {
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
    )

    while (true) {
      if (options.ignoreCase && inputElement.value.toLowerCase() !== value.toLowerCase()) {
        break
      } else if (!options.ignoreCase && inputElement.value !== value) {
        break
      }
      await sleep(100)
    }
  }
}

export function waitForInputToNotHaveValueAndNotBeEmpty (inputSelector: string, value: string, options = { ignoreCase: true }) {
  return async () => {
    const inputElement = document.querySelector(
      inputSelector
    )

    while (true) {
      if (inputElement.value !== '') {
        if (options.ignoreCase && inputElement.value.toLowerCase() !== value.toLowerCase()) {
          break
        } else if (!options.ignoreCase && inputElement.value !== value) {
          break
        }
      }
      await sleep(100)
    }
  }
}

export function waitForInputToNotBeEmpty (inputSelector: string) {
  return async () => {
    const inputElement = document.querySelector(
      inputSelector
    )

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
    )
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
      )

      if (element && element.innerHTML === value) {
        break
      }
      await sleep(100)
    }
  }
}

export function waitInMs (timeInMs: number) {
  return async () => await sleep(timeInMs)
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

export function waitForLogIn () {
  return async () => {
    while (true) {
      if (localStorage.getItem('token') !== null) {
        break
      }
      await sleep(100)
    }
  }
}

export function waitForLogOut () {
  return async () => {
    while (true) {
      if (localStorage.getItem('token') === null) {
        break
      }
      await sleep(100)
    }
  }
}

/**
 * see https://stackoverflow.com/questions/7798748/find-out-whether-chrome-console-is-open/48287643#48287643
 */
export function waitForDevTools () {
  let checkStatus = false

  const element = new Image()
  Object.defineProperty(element, 'id', {
    get: function () {
      checkStatus = true
    }
  })

  return async () => {
    while (true) {
      console.dir(element)
      console.clear()
      if (checkStatus) {
        break
      }
      await sleep(100)
    }
  }
}
