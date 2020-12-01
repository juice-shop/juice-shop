/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import {
  waitForInputToHaveValue,
  waitForInputToNotBeEmpty,
  waitForElementToGetClicked,
  waitInMs,
  waitForAngularRouteToBeVisited, waitForLogOut
} from '../helpers/helpers'
import { ChallengeInstruction } from '../'

export const PasswordStrengthInstruction: ChallengeInstruction = {
  name: 'Password Strength',
  hints: [
    {
      text:
        "To start this challenge, you'll have to log out first.",
      fixture: '#navbarAccount',
      unskippable: true,
      resolved: waitForLogOut()
    },
    {
      text:
        "In this challenge we'll try to log into the administrator's user account using his original credentials.",
      fixture: 'app-navbar',
      resolved: waitInMs(7000)
    },
    {
      text:
        "If you don't know it already, you must first find out the admin's email address. The user feedback and product reviews are good places to look into. When you have it, go to the _Login_ page.",
      fixture: 'app-navbar',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('login')
    },
    {
      text: "Enter the admin's email address into the **email field**.",
      fixture: '#email',
      unskippable: true,
      resolved: waitForInputToHaveValue('#email', 'admin@juice-sh.op') // TODO Use domain from config instead
    },
    {
      text: 'Now for the password. Lucky for us, the admin chose a really, really, **really** stupid one. Just try any that comes to your mind!',
      fixture: '#password',
      unskippable: true,
      resolved: waitForInputToNotBeEmpty('#password')
    },
    {
      text: "🤦‍♂️ Nah, that was wrong! Keep trying! I'll tell you when you're one the right track.",
      fixture: '#password',
      unskippable: true,
      resolved: waitForInputToHaveValue('#password', 'admin')
    },
    {
      text: 'Okay, you are one the right track, but this would have been the worst password in the world for an admin. He spiced it up a little bit with some extra non-letter characters. Keep trying!',
      fixture: '#password',
      unskippable: true,
      resolved: waitForInputToHaveValue('#password', 'admin1')
    },
    {
      text: "🔥 Yes, it's getting warmer! Try adding some more numbers maybe?",
      fixture: '#password',
      unskippable: true,
      resolved: waitForInputToHaveValue('#password', 'admin12')
    },
    {
      text: "🧯 It's getting hot! Just one more digit...",
      fixture: '#password',
      unskippable: true,
      resolved: waitForInputToHaveValue('#password', 'admin123')
    },
    {
      text: 'Okay, now press the _Log in_ button.',
      fixture: '#rememberMe',
      unskippable: true,
      resolved: waitForElementToGetClicked('#loginButton')
    },
    {
      text:
        '🎉 Congratulations! You have been logged in as the **administrator** of the shop thanks to his very ill chosen password!',
      fixture: 'app-navbar',
      resolved: waitInMs(20000)
    }
  ]
}
