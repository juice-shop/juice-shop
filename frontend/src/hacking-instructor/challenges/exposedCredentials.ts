/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  waitForInputToHaveValue,
  waitForElementToGetClicked,
  waitInMs,
  waitForAngularRouteToBeVisited, waitForLogOut, waitForDevTools
} from '../helpers/helpers'
import { type ChallengeInstruction } from '../'

export const ExposedCredentialsInstruction: ChallengeInstruction = {
  name: 'Exposed credentials',
  hints: [
    {
      text:
        'To start this challenge, you will have to log out first.',
      fixture: '#navbarAccount',
      unskippable: true,
      resolved: waitForLogOut()
    },
    {
      text:
        'As the challenge suggests, let us have a look at the client-side code. Open the dev tools.',
      fixture: 'app-navbar',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitForDevTools()
    },
    {
      text:
        'Go to Sources, and then inspect the main.js file. This is where all the client-side code is.',
      fixture: 'app-navbar',
      resolved: waitInMs(10000)
    },
    {
      text:
        'Now, why not search for some common words related to credentials? Maybe try password, pw, or username.',
      fixture: 'app-navbar',
      resolved: waitInMs(35000)
    },
    {
      text:
        'Once you found the hardcoded credentials, go to the login page.',
      fixture: 'app-navbar',
      resolved: waitForAngularRouteToBeVisited('login')
    },
    {
      text: 'Write the email address in the **email field**.',
      fixture: '#email',
      unskippable: true,
      resolved: waitForInputToHaveValue('#email', 'testing@juice-sh.op', { replacement: ['juice-sh.op', 'application.domain'] })
    },
    {
      text: 'Now write the password in the **password field**.',
      fixture: '#password',
      unskippable: true,
      resolved: waitForInputToHaveValue('#password', 'IamUsedForTesting')
    },
    {
      text: 'Press the _Log in_ button.',
      fixture: '#rememberMe',
      unskippable: true,
      resolved: waitForElementToGetClicked('#loginButton')
    },
    {
      text:
        '🎉 Congratulations! You have been logged in with exposed credentials!',
      fixture: 'app-navbar',
      resolved: waitInMs(5000)
    }
  ]
}
