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
          'Start by going to your saved addresses. You can find them by clicking on "Account" in the navigation bar, then on Orders & Payment, and then on My saved addresses.',
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('address/saved')
    },
    {
      text:
          'Add a new address.',
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('address/create')
    },
    {
      text:
          'You see a few fields to submit input. This is always a good starting point for checking potential XSS vulnerabilities. Pay attention to the pop-up once you submitted the new address.',
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('address/saved')
    },
    {
      text:
          'Observe how the name of the city was used in the pop-up once you submit the address. Let us try to check whether this page is vulnerable to reflected XSS. Submit a new address.',
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('address/create')
    },
    {
      text:
          'Use: <code>&lt;iframe src="javascript:alert(&#96;xss&#96;)"&gt;</code> as a city name.',
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('address/saved')
    },
    {
      text:
          'Hmmm, that did not seem to work :/. We might want to try another part of the website. Let us explore the order and payment pages. First, place an order. You can add any item to your basket and complete the purchase.',
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
          'In a reflected XSS attack, a payload is often included in URI or HTTP parameters. Pay attention to the id parameter in the url. Could it be vulnerable to reflected XSS? Give it a try by replacing the value of the id parameter with the payload: <code>&lt;iframe src="javascript:alert(&#96;xss&#96;)"&gt;</code>. Do not enter immediately. We will let you know once you have the correct URL in place.',
      fixture: 'app-navbar',
      resolved: waitForRightUriQueryParamPair('id', '<iframe src="javascript:alert(`xss`)">')
    },
    {
      text:
          'That looks right! Now you can hit enter to solve this challenge. If an alert box appears, confirm it to close it. Happy hacking :)',
      fixture: 'app-navbar',
      resolved: waitInMs(10000)
    }
  ]
}
