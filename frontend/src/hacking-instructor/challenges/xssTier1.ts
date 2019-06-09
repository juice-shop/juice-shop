import {
  waitForInputToHaveValue,
  waitForElementToGetClicked,
  waitInMs
} from '../helpers/helpers'
import { ChallengeInstruction } from '../'

export const XssTier1Instruction: ChallengeInstruction = {
  name: 'XSS Tier 1',
  hints: [
    {
      text:
        "For this challenge, we'll take a close look at the _Search_ field at the top of the screen.",
      fixture: '#searchQuery',
      unskippable: true,
      resolved: waitInMs(8000)
    },
    {
      text: "Let's start by searching for all products containing `owasp` in their name or description.",
      fixture: '#searchQuery',
      resolved: waitForInputToHaveValue('#searchQuery', 'owasp')
    },
    {
      text: 'Click the _Search_ button.',
      fixture: '#searchButton',
      resolved: waitForElementToGetClicked('#searchButton')
    },
    {
      text: 'Nice! You should now see many cool OWASP-related products.',
      fixture: '#searchQuery',
      resolved: waitInMs(8000)
    },
    {
      text: 'You might have noticed, that your search term is displayed above the results?',
      fixture: 'app-search-result',
      resolved: waitInMs(8000)
    },
    {
      text: 'What we will try now is a **Cross-Site Scripting (XSS)** attack, where we try to inject HTML or JavaScript code into the application.',
      fixture: 'app-search-result',
      resolved: waitInMs(15000)
    },
    {
      text: 'Change your search value into `<h1>owasp` to see if we can inject HTML.',
      fixture: '#searchQuery',
      resolved: waitForInputToHaveValue('#searchQuery', '<h1>owasp')
    },
    {
      text: 'Click the _Search_ button.',
      fixture: '#searchButton',
      resolved: waitForElementToGetClicked('#searchButton')
    },
    {
      text: "Hmm, this doesn't look normal, does it?",
      fixture: 'app-search-result',
      resolved: waitInMs(8000)
    },
    {
      text: 'If you right-click on the search term and inspect that part of the page with your browser, you will see that our `h1`-tag was _actually_ embedded into the page and is not just shown as plain text!',
      fixture: 'app-search-result',
      resolved: waitInMs(16000)
    },
    {
      text: "Let's now try to inject JavaScript. Type `<script>alert(xss)</script>` into the search box now.",
      fixture: '#searchQuery',
      resolved: waitForInputToHaveValue('#searchQuery', '<script>alert(xss)</script>')
    },
    {
      text: 'Click the _Search_ button again.',
      fixture: '#searchButton',
      resolved: waitForElementToGetClicked('#searchButton')
    },
    {
      text: "😔 This didn't work as we hoped. If you inspect the page, you should see the `script`-tag but it is not executed for some reason.",
      fixture: 'app-search-result',
      resolved: waitInMs(10000)
    },
    {
      text: "Luckily there are _many_ different XSS payloads we can try. Let's try this one next: `<iframe src=\"javascript:alert(\`xss\`)\">`.",
      fixture: '#searchQuery',
      resolved: waitForInputToHaveValue('#searchQuery', '<iframe src="javascript:alert(`xss`)">')
    },
    {
      text: 'Please click the _Search_ button one more time. If an alert box appears, you must confirm it in order to close it.',
      fixture: '#searchButton',
      resolved: waitForElementToGetClicked('#searchButton')
    },
    {
      text:
        '🎉 Congratulations! You just successfully performed an XSS attack!',
      fixture: 'app-search-result',
      resolved: waitInMs(8000)
    },
    {
      text:
        'More precisely, this was a **DOM XSS** attack, because your payload was handled and improperly embedded into the page by the application frountend code without ever sending it to the server.',
      fixture: 'app-search-result',
      resolved: waitInMs(16000)
    }
  ]
}
