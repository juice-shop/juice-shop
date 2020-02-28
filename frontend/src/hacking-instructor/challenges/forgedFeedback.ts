import {
    waitInMs,
    sleep, waitForAngularRouteToBeVisited, waitForLogIn
  } from '../helpers/helpers'
import { ChallengeInstruction } from '../'

export const ForgedFeedbackInstruction: ChallengeInstruction = {
  name: 'Forged Feedback',
  hints: [
    {
      text:
          'To start this challenge, first go to the _Customer Feedback_ page.',
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('contact')
    },
    {
      text:
          'This challenge is about broken access controls. To pass it you need to impersonate a user providing feedback.',
      fixture: 'app-navbar',
      unskippable: false,
      resolved: waitInMs(8000)
    },
    {
      text:
          "Open the browser's _Development Tools_ and try finding anything interesting while inspecting the form.",
      fixture: 'app-navbar',
      unskippable: false,
      resolved: waitInMs(15000)
    },
    {
      text:
          'There is more than meets the eye. ;)',
      fixture: 'app-navbar',
      unskippable: false,
      resolved: waitInMs(8000)
    },
    {
      text:
          'Manipulating user inputs is a great first step when testing access controls.',
      fixture: 'app-navbar',
      unskippable: true,
      async resolved () {
        let userId = (document.getElementById('userId') as HTMLInputElement).value
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
          '🎉 Congratulations! You found the secret. Submit the form to complete the challenge.',
      fixture: 'app-navbar',
      unskippable: false,
      resolved: waitInMs(15000)
    }
  ]
}
