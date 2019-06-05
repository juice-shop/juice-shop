import {
  waitForInputToHaveValue,
  waitForInputToNotHaveValue,
  waitForElementToGetClicked,
  waitInMs,
  sleep
} from '../helpers/helpers'
import { ChallengeInstruction } from '../'

export const SqlOneInstructions: ChallengeInstruction = {
  name: 'Login Admin',
  hints: [
    {
      text:
        "To start this challenge you'll have to log out first.",
      fixture: '#navbarLogoutButton',
      unskippable: true,
      async resolved () {
        while (true) {
          if (localStorage.getItem('token') === null) {
            break
          }
          await sleep(100)
        }
      }
    },
    {
      text:
        "Let's try if we find a way to log in with the administrator's user account. For starters go to the login page.",
      fixture: '#navbarLoginButton',
      unskippable: true,
      async resolved () {
        while (true) {
          if (window.location.hash === '#/login') {
            break
          }
          await sleep(100)
        }
      }
    },
    {
      text: 'To find a way around the normal login protection we will try to use a SQL injection (SQLi).',
      fixture: '#email',
      resolved: waitInMs(8000)
    },
    {
      text: "A good starting point for simple SQL injections is to insert quatation marks (like \" or '). These mess with the syntax of the query and might give you indications if an endpoint is vulnarable or not.",
      fixture: '#email',
      resolved: waitInMs(15000)
    },
    {
      text: "Start with entering ' in the email field.",
      fixture: '#email',
      resolved: waitForInputToHaveValue('#email', "'")
    },
    {
      text: "Now put anything in the password field. Doesn't matter what.",
      fixture: '#password',
      resolved: waitForInputToNotHaveValue('#password', '')
    },
    {
      text: 'Press the log in button',
      fixture: '#loginButton',
      resolved: waitForElementToGetClicked('#loginButton')
    },
    {
      text: 'Nice! Do you see the error in the top? Unfortunatly it isnt really telling us much of what went wrong...',
      fixture: '#loginButton',
      resolved: waitInMs(10000)
    },
    {
      text: 'Maybe you will be able to find out more information about the error in the JavaScript console or the network tab of your browser.',
      fixture: '#loginButton',
      resolved: waitInMs(10000)
    },
    {
      text: 'Did you spot the SQL query in the there? If not, take another look.',
      fixture: '#loginButton',
      resolved: waitInMs(10000)
    },
    {
      text: "Let's try to manipulate the query a bit more. Try out tryping \"' OR true\” into the email field.",
      fixture: '#email',
      resolved: waitForInputToHaveValue('#email', "' OR true")
    },
    {
      text: 'Now click the log in button again',
      fixture: '#loginButton',
      resolved: waitForElementToGetClicked('#loginButton')
    },
    {
      text: 'Mhh... The query is still failing? Do you see why in the console?',
      fixture: '#loginButton',
      resolved: waitInMs(8000)
    },
    {
      text: 'We need to make sure that the rest of the query after our injection doesnt get executed. Any Ideas?',
      fixture: '#loginButton',
      resolved: waitInMs(8000)
    },
    {
      text: 'You can comment out the rest of the quries using comments in sql. In sqlite you can use "--" for that',
      fixture: '#loginButton',
      resolved: waitInMs(8000)
    },
    {
      text: 'So type in "\' OR true --" in the email field.',
      fixture: '#email',
      resolved: waitForInputToHaveValue('#email', "' OR true --")
    },
    {
      text: 'Press the log in button',
      fixture: '#loginButton',
      resolved: waitForElementToGetClicked('#loginButton')
    },
    {
      text:
        '🎉 That worked right?! Concratulation on being the new administartor in the shop!.',
      fixture: '#searchQuery',
      resolved: waitInMs(10000)
    }
  ]
}
