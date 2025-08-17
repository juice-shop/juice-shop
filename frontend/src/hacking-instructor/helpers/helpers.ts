/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import jwtDecode from 'jwt-decode'

let config
const playbackDelays = {
  faster: 0.5,
  fast: 0.75,
  normal: 1.0,
  slow: 1.25,
  slower: 1.5
}

export async function sleep (timeInMs: number): Promise<void> {
  await new Promise((resolve) => {
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
      element.addEventListener('click', () => { resolve() })
    })
  }
}

export function waitForElementsInnerHtmlToBe (elementSelector: string, value: string) {
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
  return async () => {
    if (!config) {
      const res = await fetch('/rest/admin/application-configuration')
      const json = await res.json()
      config = json.config
    }
    let delay = playbackDelays[config.hackingInstructor.hintPlaybackSpeed]
    delay ??= 1.0
    await sleep(timeInMs * delay)
  }
}

export function waitForAngularRouteToBeVisited (route: string) {
  return async () => {
    while (true) {
      if (window.location.hash.startsWith(`#/${route}`)) {
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

export function waitForAdminLogIn () {
  return async () => {
    while (true) {
      let role: string = ''
      try {
        const token: string = localStorage.getItem('token')
        const decodedToken = jwtDecode(token)
        const payload = decodedToken as any
        role = payload.data.role
      } catch {
        console.log('Role from token could not be accessed.')
      }
      if (role === 'admin') {
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
 * does detect when devtools are opened horizontally or vertically but not when undocked or open on page load
 */
export function waitForDevTools () {
  const initialInnerHeight = window.innerHeight
  const initialInnerWidth = window.innerWidth
  return async () => {
    while (true) {
      if (window.innerHeight !== initialInnerHeight || window.innerWidth !== initialInnerWidth) {
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

export function waitForRightUriQueryParamPair (key: string, value: string) {
  return async () => {
    while (true) {
      const encodedValue: string = encodeURIComponent(value).replace(/%3A/g, ':')
      const encodedKey: string = encodeURIComponent(key).replace(/%3A/g, ':')
      const expectedHash: string = `#/track-result/new?${encodedKey}=${encodedValue}`

      if (window.location.hash === expectedHash) {
        break
      }
      await sleep(100)
    }
  }
}
