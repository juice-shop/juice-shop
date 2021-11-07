/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  waitInMs, waitForElementToGetClicked
} from '../helpers/helpers'
import { ChallengeInstruction } from '../'

export const CodingChallengesInstruction: ChallengeInstruction = {
  name: 'Coding Challenges',
  hints: [
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
    }
  ]
}
