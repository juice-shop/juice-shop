import {
    waitInMs,
    sleep, waitForAngularRouteToBeVisited, waitForLogIn
  } from '../helpers/helpers'
import { ChallengeInstruction } from '../'

export const ViewBasketInstruction: ChallengeInstruction = {
  name: 'View Basket',
  hints: [
    {
      text:
          "To start this challenge, you'll have to log in first. This challenge is about broken access controls.",
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForLogIn()
    },
    {
      text:
          'First, go to your _Your Basket_ page.',
      fixture: 'app-navbar',
      unskippable: true,
      resolved: waitForAngularRouteToBeVisited('basket')
    },
    {
      text:
          'To pass this challenge, you will need to peak into another user session.',
      fixture: 'app-navbar',
      unskippable: false,
      resolved: waitInMs(8000)
    },
    {
      text:
          "Open the browser's _Development Tools_ and locate the Session storage tab. This panel shows the Session key/value pairs stored locally for each website.",
      fixture: 'app-navbar',
      unskippable: false,
      resolved: waitInMs(15000)
    },
    {
      text:
          'Look for interesting Session key names. Do you see something that might be related to the Basket? Try updating it. ;)',
      fixture: 'app-navbar',
      unskippable: true,
      async resolved () {
        let bid = sessionStorage.getItem('bid')
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
          'You have changed the Basket id value. Could the access control be broken?',
      fixture: 'app-navbar',
      unskippable: true,
      async resolved () {
        let total = sessionStorage.getItem('itemTotal')
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
          "🎉 Congratulations! You are viewing another user's basket.",
      fixture: 'app-navbar',
      unskippable: false,
      resolved: waitInMs(15000)
    }
  ]
}
