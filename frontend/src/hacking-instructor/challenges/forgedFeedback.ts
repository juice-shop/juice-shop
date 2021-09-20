/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  waitInMs,
  sleep, waitForAngularRouteToBeVisited, waitForElementToGetClicked, waitForDevTools
} from '../helpers/helpers'
import { ChallengeInstruction } from '../'

export const ForgedFeedbackInstruction: ChallengeInstruction = {
  name: 'Forged Feedback',
  hints: [
    {
      text:
          'To start this challenge, first go to the _Customer Feedback_ page.',
      fixture: 'app-navbar',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('contact')
    },
    {
      text:
          'This challenge is about broken access controls. To pass it, you need to impersonate another user while providing feedback.',
      fixture: 'app-navbar',
      resolved: waitInMs(10000)
    },
    {
      text:
          'If you would now submit feedback, it would be posted by yourself while logged in or anonymously while logged out.',
      fixture: 'app-navbar',
      resolved: waitInMs(10000)
    },
    {
      text:
          'We will now search for any mistake the application developers might have made in setting the author of any new feedback.',
      fixture: 'app-navbar',
      resolved: waitInMs(10000)
    },
    {
      text:
          "Open the browser's _Development Tools_ and try finding anything interesting while inspecting the feedback form.",
      fixture: 'app-navbar',
      resolved: waitForDevTools()
    },
    {
      text:
          'There is more than meets the eye among the fields of the form... 😉',
      fixture: 'app-navbar',
      resolved: waitInMs(8000)
    },
    {
      text:
          "Once you found the field that shouldn't even be there, try manipulating its value to one that might represent another user!",
      fixture: 'app-navbar',
      unskippable: true,
      async resolved () {
        const userId = (document.getElementById('userId') as HTMLInputElement).value
        while (true) {
          if ((document.getElementById('userId') as HTMLInputElement).value !== userId) {
            break
          }
          await sleep(100)
        }
      }
    },
    {
      text:
          'You found and changed the invisible `userId`! Now submit the form to complete the challenge.',
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForElementToGetClicked('#submitButton')
    },
    {
      text:
          '🎉 Congratulations, you successfully submitted a feedback as another user!',
      fixture: 'app-navbar',
      resolved: waitInMs(15000)
    }
  ]
}
