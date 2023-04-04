/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  waitForInputToHaveValue,
  waitForElementsInnerHtmlToBe,
  waitInMs
} from '../helpers/helpers'
import { ChallengeInstruction } from '../'

export const DomXssInstruction: ChallengeInstruction = {
  name: 'DOM XSS',
  hints: [
    {
      text:
        "For this challenge, we'll take a close look at the _Search_ field at the top of the screen.",
      fixture: '.fill-remaining-space',
      unskippable: true,
      resolved: waitInMs(8000)
    },
    {
      text: "Let's start by searching for all products containing `owasp` in their name or description.",
      fixture: '.fill-remaining-space',
      unskippable: true,
      resolved: waitForInputToHaveValue('#searchQuery input', 'owasp')
    },
    {
      text: 'Now hit enter.',
      fixture: '.fill-remaining-space',
      unskippable: true,
      resolved: waitForElementsInnerHtmlToBe('#searchValue', 'owasp')
    },
    {
      text: 'Nice! You should now see many cool OWASP-related products.',
      fixture: '.fill-remaining-space',
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
      fixture: '.fill-remaining-space',
      unskippable: true,
      resolved: waitForInputToHaveValue('#searchQuery input', '<h1>owasp')
    },
    {
      text: 'Hit enter again.',
      fixture: '.fill-remaining-space',
      unskippable: true,
      resolved: waitForElementsInnerHtmlToBe('#searchValue', '<h1>owasp</h1>') // Browsers will autocorrect the unclosed tag.
    },
    {
      text: "Hmm, this doesn't look normal, does it?",
      fixture: '.noResult',
      resolved: waitInMs(8000)
    },
    {
      text: 'If you right-click on the search term and inspect that part of the page with your browser, you will see that our `h1`-tag was _actually_ embedded into the page and is not just shown as plain text!',
      fixture: '.noResult',
      resolved: waitInMs(16000)
    },
    {
      text: "Let's now try to inject JavaScript. Type `<script>alert(xss)</script>` into the search box now.",
      fixture: '.fill-remaining-space',
      unskippable: true,
      resolved: waitForInputToHaveValue('#searchQuery input', '<script>alert(xss)</script>')
    },
    {
      text: 'Hit enter again.',
      fixture: '.fill-remaining-space',
      unskippable: true,
      resolved: waitForElementsInnerHtmlToBe('#searchValue', '<script>alert(xss)</script>')
    },
    {
      text: "😔 This didn't work as we hoped. If you inspect the page, you should see the `script`-tag but it is not executed for some reason.",
      fixture: '.noResult',
      resolved: waitInMs(10000)
    },
    {
      text: "Luckily there are _many_ different XSS payloads we can try. Let's try this one next: <code>&lt;iframe src=\"javascript:alert(&#96;xss&#96;)\"&gt;</code>.",
      fixture: '.fill-remaining-space',
      unskippable: true,
      resolved: waitForInputToHaveValue('#searchQuery input', '<iframe src="javascript:alert(`xss`)">')
    },
    {
      text: 'Hit enter one more time. If an alert box appears, you must confirm it in order to close it.',
      fixture: '.fill-remaining-space',
      unskippable: true,
      resolved: waitForElementsInnerHtmlToBe('#searchValue', '<iframe src="javascript:alert(`xss`)"></iframe>')
    },
    {
      text:
        '🎉 Congratulations! You just successfully performed an XSS attack!',
      fixture: '.noResult',
      resolved: waitInMs(8000)
    },
    {
      text:
        'More precisely, this was a **DOM XSS** attack, because your payload was handled and improperly embedded into the page by the application frontend code without even sending it to the server.',
      fixture: '.noResult',
      resolved: waitInMs(16000)
    }
  ]
}
