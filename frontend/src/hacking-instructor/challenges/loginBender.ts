/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import {
  waitForInputToHaveValue,
  waitForElementToGetClicked,
  waitInMs,
  waitForAngularRouteToBeVisited, waitForLogOut, waitForInputToNotHaveValueAndNotBeEmpty
} from '../helpers/helpers'
import { ChallengeInstruction } from '../'

export const LoginBenderInstruction: ChallengeInstruction = {
  name: 'Login Bender',
  hints: [
    {
      text:
        "To start this challenge, you'll have to log out first.",
      fixture: '#navbarAccount',
      unskippable: true,
      resolved: waitForLogOut() // TODO Add check if "Login Admin" is solved and if not recommend doing that first
    },
    {
      text:
        "Let's try if we find a way to log in with Bender's user account. To begin, go to the _Login_ page via the _Account_ menu.",
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('login')
    },
    {
      text:
        "As you would expect you need to supply Bender's email address and password to log in regularly. But you might have neither at the moment.",
      fixture: 'app-navbar',
      resolved: waitInMs(15000)
    },
    {
      text:
        'If we had at least the email address, we could then try a **SQL Injection** (SQLi) attack to avoid having to supply a password.',
      fixture: 'app-navbar',
      resolved: waitInMs(15000)
    },
    {
      text:
        "So, let's go find out Bender's email! Luckily the shop is very bad with privacy and leaks emails in different places, for instance in the user feedback.",
      fixture: 'app-navbar',
      resolved: waitInMs(15000)
    },
    {
      text:
        'Go to the _About Us_ page where user feedback is displayed among other things.',
      fixture: 'app-navbar',
      resolved: waitForAngularRouteToBeVisited('about')
    },
    {
      text:
        'Once you found an entry by Bender in the feedback carousel leaking enough of his email to deduce the rest, go to the _Login_ screen.',
      fixture: 'app-about',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('login')
    },
    {
      text: "Supply Bender's email address in the **email field**.",
      fixture: '#email',
      unskippable: true,
      resolved: waitForInputToHaveValue('#email', 'bender@juice-sh.op') // TODO Use domain from config instead
    },
    {
      text: "Now put anything in the **password field**. Let's assume we don't know it yet, even if you happen to already do.",
      fixture: '#password',
      unskippable: true,
      resolved: waitForInputToNotHaveValueAndNotBeEmpty('#password', 'OhG0dPlease1nsertLiquor!')
    },
    {
      text: 'Press the _Log in_ button.',
      fixture: '#rememberMe',
      unskippable: true,
      resolved: waitForElementToGetClicked('#loginButton')
    },
    {
      text: "This didn't work, but did you honestly expect it to? We need to craft an SQLi attack first!",
      fixture: '#rememberMe',
      resolved: waitInMs(10000)
    },
    {
      text: "You can comment out the entire password check clause of the DB query by adding `'--` to Bender's email address!",
      fixture: '#email',
      unskippable: true,
      resolved: waitForInputToHaveValue('#email', "bender@juice-sh.op'--") // TODO Use domain from config instead
    },
    {
      text: 'Now click the _Log in_ button again.',
      fixture: '#rememberMe',
      unskippable: true,
      resolved: waitForElementToGetClicked('#loginButton')
    },
    {
      text:
        '🎉 Congratulations! You have been logged in as Bender!',
      fixture: 'app-navbar',
      resolved: waitInMs(5000)
    }
  ]
}
