/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  waitInMs, waitForElementToGetClicked, waitForAngularRouteToBeVisited
} from '../helpers/helpers'
import { ChallengeInstruction } from '../'

export const CodingChallengesInstruction: ChallengeInstruction = {
  name: 'Coding Challenges',
  hints: [
    {
      text:
        'To do the tutorial on _Coding Challenges_, you have to find and visit the _Score Board_ first. Once there, you have to click the tutorial button for the _Score Board_ challenge to proceed.',
      fixture: 'app-navbar',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('score-board') // FIXME The tutorial does not progress automatically. Workaround ^^^^^^^^^^^^^^^^ instruction above should be removed when fixed.
    },
    {
      text:
        'Many Juice Shop hacking challenges come with an associated _Coding Challenge_ which will teach you more about the underlying vulnerability on source code level.',
      fixture: '#Score\\ Board\\.solved',
      resolved: waitInMs(15000)
    },
    {
      text:
        'You can launch a Coding Challenge via the `<>`-button. Click the one for the _Score Board_ challenge now.',
      fixture: '#codingChallengeTutorialButton',
      unskippable: true,
      resolved: waitForElementToGetClicked('#Score\\ Board\\.codingChallengeButton')
    },
    {
      text:
        'All Coding Challenges take place in a modal dialog like this. They consist of two parts, one for finding and one for fixing the vulnerability in the code.',
      fixture: '#code-snippet',
      resolved: waitInMs(15000)
    },
    {
      text:
        'The code snippet below shows a part of the actual application source code retrieved in real-time.',
      fixture: '#code-snippet',
      resolved: waitInMs(10000)
    },
    {
      text:
        'You will always get a snippet that is involved in the security vulnerability or flaw behind the corresponding hacking challenge. In this case, you see the routing code that exposes all dialogs, including the supposedly "well-hidden" Score Board.',
      fixture: '#code-snippet',
      resolved: waitInMs(20000)
    },
    {
      text:
        'For the "Find It" part of this coding challenge, tick the 🔲 on all lines of code that you think are responsible for exposing the Score Board. When done, click the _Submit_ button.',
      fixture: '#code-snippet',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitForElementToGetClicked('#line114')
    },
    {
      text:
        'That\'s the one! Click the _Submit_ button proceed.',
      fixture: '#code-snippet',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitForElementToGetClicked('#findItSubmitButton')
    },
    {
      text:
        '🎊! You made it half-way through! In phase two you are now presented with several fix options. You must select the one which you think is the **best possible** fix for the security vulnerability.',
      fixture: '#code-snippet',
      resolved: waitInMs(10000)
    },
    {
      text:
        'This coding challenge is a bit "special", because the Score Board is crucial for progress tracking and acts as a hub for the other challenges. Keep that in mind when picking the _Correct Fix_ from the options _Fix 1_, _2_ and _3_.',
      fixture: '#code-snippet',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitForElementToGetClicked('#fixItSubmitButton')
    },
    {
      text:
        'If you did\'nt get the answer right, just try again until the 🎊-cannon fires. Then click _Close_ to end the coding challenge and return to the Score Board.',
      fixture: '#code-snippet',
      fixtureAfter: true,
      unskippable: true,
      resolved: waitForElementToGetClicked('#fixItCloseButton')
    }
  ]
}
