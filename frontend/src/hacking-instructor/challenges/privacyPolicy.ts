/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  waitInMs, waitForAngularRouteToBeVisited, waitForElementToGetClicked, waitForLogIn
} from '../helpers/helpers'
import { type ChallengeInstruction } from '../'

export const PrivacyPolicyInstruction: ChallengeInstruction = {
  name: 'Privacy Policy',
  hints: [
    {
      text:
        'Log in with any user to begin this challenge. You can use an existing or freshly registered account.',
      fixture: 'app-navbar',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitForLogIn()
    },
    {
      text:
        'Great, you are logged in! Now open the _Account_ menu.',
      fixture: '#navbarAccount',
      resolved: waitForElementToGetClicked('#navbarAccount')
    },
    {
      text:
        'Open the _Privacy & Security_ sub-menu and click _Privacy Policy_.',
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('privacy-security/privacy-policy')
    },
    {
      text: '🎉 That was super easy, right? This challenge is a bit of a joke actually, because nobody reads any fine print online... 🙈',
      fixture: 'app-navbar',
      resolved: waitInMs(60000)
    }
  ]
}
