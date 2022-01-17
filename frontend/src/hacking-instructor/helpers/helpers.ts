/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

let config

export async function sleep (timeInMs: number): Promise<void> {
  return await new Promise((resolve) => {
    setTimeout(resolve, timeInMs)
  })
}

export function waitForInputToHaveValue (inputSelector: string, value: string, options: any = { ignoreCase: true, replacement: [] }) {
  return async () => {
    const inputElement: HTMLInputElement = document.querySelector(
      inputSelector
    )

    if (options.replacement?.length === 2) {
      if (!config) {
        const res = await fetch('/rest/admin/application-configuration')
        const json = await res.json()
        config = json.config
      }
      const propertyChain = options.replacement[1].split('.')
      let replacementValue = config
      for (const property of propertyChain) {
        replacementValue = replacementValue[property]
      }
      value = value.replace(options.replacement[0], replacementValue)
    }

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
    const inputElement: HTMLInputElement = document.querySelector(
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
    const inputElement: HTMLInputElement = document.querySelector(
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
    const inputElement: HTMLInputElement = document.querySelector(
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

    await new Promise<void>((resolve) => {
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

export function waitForAngularRouteToBeVisited (route: string) {
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

export function waitForSelectToHaveValue (selectSelector: string, value: string) {
  return async () => {
    const selectElement: HTMLSelectElement = document.querySelector(
      selectSelector
    )

    while (true) {
      if (selectElement.options[selectElement.selectedIndex].value === value) {
        break
      }
      await sleep(100)
    }
  }
}

export function waitForSelectToNotHaveValue (selectSelector: string, value: string) {
  return async () => {
    const selectElement: HTMLSelectElement = document.querySelector(
      selectSelector
    )

    while (true) {
      if (selectElement.options[selectElement.selectedIndex].value !== value) {
        break
      }
      await sleep(100)
    }
  }
}
