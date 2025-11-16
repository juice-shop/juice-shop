/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  waitInMs,
  waitForElementToGetClicked,
  waitForAngularRouteToBeVisited,
  waitForAdminLogIn
} from '../helpers/helpers'
import { type ChallengeInstruction } from '../'

export const AdminSectionInstruction: ChallengeInstruction = {
  name: 'Admin Section',
  hints: [
    {
      text: 'For this challenge, you need to be logged in as an admin. If you have not done so yet, solve the admin login challenge first. Otherwise, log in as an admin.',
      fixture: '.fill-remaining-space',
      unskippable: false,
      resolved: waitForAdminLogIn()
    },
    {
      text: 'A good way to start looking for an admin section is by understanding what technologies a website is built on. One way to do this is by clicking through the website and being attentive to hints. Start by opening the side menu (the hamburger icon in the top left corner).',
      fixture: '.fill-remaining-space',
      unskippable: true,
      resolved: waitForElementToGetClicked('button[aria-label="Open Sidenav"]')
    },
    {
      text: 'Inspect those icons. Can you guess what they are?',
      fixture: '.appVersion',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitInMs(8000)
    },
    {
      text: 'This is the tech stack of the website. You see HTML, JavaScript, and more.',
      fixture: '.appVersion',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitInMs(8000)
    },
    {
      text: 'You could search for common web technologies and see if you recognize any logos.',
      fixture: '.appVersion',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitInMs(8000)
    },
    {
      text: 'And you will find that the first logo is Angular.',
      fixture: '.appVersion',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitInMs(8000)
    },
    {
      text: 'Close the side menu again.',
      fixture: '.appVersion',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitInMs(4000)
    },
    {
      text: 'These kinds of hints can tell you a lot. For example, if we found a WordPress site, a common admin path to look for would be /wp-admin.',
      fixture: 'app-navbar',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitInMs(10000)
    },
    {
      text: 'In Angular, each route maps a URL path to a component. To find the admin section, try navigating to the /admin path and see what happens.',
      fixture: 'app-navbar',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('admin')
    },
    {
      text: 'Mmmmh, this did not work as expected. Let us try another one. Maybe /administration will work?',
      fixture: 'app-navbar',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('administration')
    },
    {
      text: '🎉 Congratulations! You successfully accessed the admin section!',
      fixture: 'app-navbar',
      resolved: waitInMs(6000)
    },
    {
      text: 'Most often, it is harder to find the tech stack. Instead of guessing common admin paths, another approach would be to use the developer tools. In this case, you would notice many "ng" references, which hint towards Angular. By understanding routes and paths in Angular, you could open the debugger, inspect the JavaScript files for paths, and find /administration.',
      fixture: 'app-navbar',
      resolved: waitInMs(16000)
    },
    {
      text: 'Always keep your eyes open when inspecting a website. Once you have identified the technologies used, leverage them to your advantage, and do not forget to read the docs!',
      fixture: 'app-navbar',
      resolved: waitInMs(10000)
    },
    {
      text: 'If you like, try to access the admin section without admin credentials. What do you think would happen? Happy hacking :)',
      fixture: 'app-navbar',
      resolved: waitInMs(8000)
    }
  ]
}
