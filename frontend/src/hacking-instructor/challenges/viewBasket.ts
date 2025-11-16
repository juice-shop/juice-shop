/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  waitInMs,
  sleep, waitForAngularRouteToBeVisited, waitForLogIn, waitForDevTools
} from '../helpers/helpers'
import { type ChallengeInstruction } from '../'

export const ViewBasketInstruction: ChallengeInstruction = {
  name: 'View Basket',
  hints: [
    {
      text:
          "This challenge is about **Horizontal Privilege Escalation**, meaning you are supposed to access data that does not belong to your own account but to another user's.",
      fixture: 'app-navbar',
      resolved: waitInMs(18000)
    },
    {
      text:
          "To start this challenge, you'll have to log in first.",
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForLogIn()
    },
    {
      text:
          "First, go to the _Your Basket_ page to view your own shopping basket. It's likely to be empty, if you didn't add anything yet.",
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('basket')
    },
    {
      text:
          "To pass this challenge, you will need to peek into another user's basket while remaining logged in with your own account.",
      fixture: 'app-navbar',
      resolved: waitInMs(8000)
    },
    {
      text:
          'If the application stores a reference to the basket somewhere in the browser, that might be a possible attack vector.',
      fixture: 'app-navbar',
      resolved: waitInMs(12000)
    },
    {
      text:
          "Open the browser's _Development Tools_ and locate the _Session Storage_ tab. Similar to 🍪s, it can be used to store data in key/value pairs for each website.",
      fixture: 'app-navbar',
      resolved: waitForDevTools()
    },
    {
      text:
          'Look over the names of the used session keys. Do you see something that might be related to the shopping basket? Try setting it to a different value! ✍️',
      fixture: 'app-navbar',
      unskippable: true,
      async resolved () {
        const bid = sessionStorage.getItem('bid')
        while (true) {
          if (sessionStorage.getItem('bid') !== bid) {
            break
          }
          await sleep(100)
        }
      }
    },
    {
      text:
        'Great, you have changed the `bid` value which might be some ID for the shopping basket!',
      fixture: 'app-navbar',
      resolved: waitInMs(8000)
    },
    {
      text:
          'Now, go to any other screen and then back to _Your Basket_. If nothing happens you might have set an invalid or non-existing `bid`. Try another in that case.',
      fixture: 'app-navbar',
      fixtureAfter: true,
      unskippable: true,
      async resolved () {
        const total = sessionStorage.getItem('itemTotal')
        while (true) {
          if (sessionStorage.getItem('itemTotal') !== total) {
            break
          }
          await sleep(100)
        }
      }
    },
    {
      text:
          "🎉 Congratulations! You are now viewing another user's shopping basket!",
      fixture: 'app-basket',
      resolved: waitInMs(15000)
    }
  ]
}
