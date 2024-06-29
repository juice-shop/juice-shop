/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  waitForRightUriQueryParamPair,
  waitInMs,
  waitForAngularRouteToBeVisited,
  waitForLogIn
} from '../helpers/helpers'
import { type ChallengeInstruction } from '../'

export const ReflectedXssInstruction: ChallengeInstruction = {
  name: 'Reflected XSS',
  hints: [
    {
      text:
          'To proceed with this challenge, you need to be logged in. We have detected that you are not currently logged in. Please log in to continue.',
      fixture: '#navbarAccount',
      unskippable: true,
      resolved: waitForLogIn()
    },
    {
      text:
          'First, place an order. You can add any item to your basket and complete the purchase.',
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('order-completion')
    },
    {
      text:
          'Have a look at the Track Orders page.',
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('track-result')
    },
    {
      text:
          'In a reflected XSS attack, a payload is often included in URI or HTTP parameters. Pay attention to the id parameter in the url. Could it be vulnerable to reflected XSS? Give it a try by replacing the value of the id parameter with the payload: <code>&lt;iframe src="javascript:alert(&#96;xss&#96;)"&gt;</code>. Do not refresh the page immediately. We will let you know once you have the correct URL in place.',
      fixture: 'app-navbar',
      resolved: waitForRightUriQueryParamPair('id', '<iframe src="javascript:alert(`xss`)">')
    },
    {
      text:
          'That looks right! Now you can refresh the page to solve this challenge. If an alert box appears, confirm it to close it. Happy hacking :)',
      fixture: 'app-navbar',
      resolved: waitInMs(10000)
    }
  ]
}
