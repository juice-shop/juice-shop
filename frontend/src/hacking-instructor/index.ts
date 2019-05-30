interface HackingInstructorFileFormat {
  challenges: ChallengeInstruction[]
}

interface ChallengeInstruction {
  name: string
  hints: ChallengeHint[]
}

interface ChallengeHint {
  text: string
  page: string
  /**
   * Query Selector String of the Element the Hint should be displayed next to.
   */
  fixture: string
  position: string
  hideAfterHint?: boolean
}

const challengeInstructions: HackingInstructorFileFormat = {
  challenges: [
    {
      name: 'Login Admin',
      hints: [
        {
          text:
            "Log in with the administrator's user account go to the login page.",
          page: 'score-board',
          fixture: '#navbarLoginButton',
          position: 'right'
        },
        {
          text: "Try to log in with ' as email and anything in the password field.",
          page: 'login',
          fixture: '#email',
          position: 'right'
        },
        {
          text: 'Now put anything in the password field.',
          page: 'login',
          fixture: '#password',
          position: 'right'
        },
        {
          text: 'Press the log in button',
          page: 'login',
          fixture: '#loginButton',
          position: 'right'
        },
        {
          text: 'Nice! Do you see the error? Maybe you could check the console output ;)',
          page: 'login',
          fixture: '#loginButton',
          position: 'right'
        },
        {
          text: 'Did you spot the SQL query in the error message? If not, take another look again.',
          page: 'login',
          fixture: '#loginButton',
          position: 'right'
        },
        {
          text: "Let's try to manipulate the query a bit more. Try out tryping \"' OR true\” into the email field.",
          page: 'login',
          fixture: '#email',
          position: 'right'
        },
        {
          text: 'Mhh the query is still failing? Do you see why?',
          page: 'login',
          fixture: '#loginButton',
          position: 'right'
        },
        {
          text: 'We need to make sure that the rest of the query after our injection doesnt get executed. Any Ideas?',
          page: 'login',
          fixture: '#loginButton',
          position: 'right'
        },
        {
          text: 'You can comment out the rest of the quries using comments in sql. In sqlite you can use "--" for that.',
          page: 'login',
          fixture: '#email',
          position: 'right'
        },
        {
          text: 'So type in "\' OR true --" in the email field.',
          page: 'login',
          fixture: '#email',
          position: 'right'
        },
        {
          text: 'That worked right?! Concratulation on being the new administartor in the shop!',
          page: 'login',
          fixture: '#searchQuery',
          position: 'right'
        }
      ]
    }
  ]
}

function loadHint (hint: ChallengeHint): HTMLElement {
  const elem = document.createElement('div')
  elem.id = 'hacking-instructor'
  elem.style.position = 'absolute'
  elem.style.zIndex = '20000'
  elem.style.backgroundColor = '#4472C4'
  elem.style.maxWidth = '300px'
  elem.style.minWidth = '250px'
  elem.style.padding = '8px'
  elem.style.borderRadius = '8px'
  elem.style.whiteSpace = 'initial'
  elem.style.lineHeight = '1.3'
  elem.style.overflow = ''
  elem.style.top = `8px`
  elem.style.cursor = 'pointer'
  elem.innerText = hint.text

  const target = document.querySelector(hint.fixture)

  const relAnchor = document.createElement('div')
  relAnchor.style.position = 'relative'
  relAnchor.appendChild(elem)

  if (target.parentElement && target.nextElementSibling) {
    target.parentElement.insertBefore(relAnchor, target.nextElementSibling)
  } else if (target.parentNode) {
    target.parentElement.appendChild(relAnchor)
  } else {
    target.insertBefore(relAnchor, target)
  }

  return relAnchor
}

function waitForClick (element: HTMLElement) {
  return new Promise((resolve) => {
    element.addEventListener('click', () => resolve())
  })
}

export function hasInstructions (challengeName: String): boolean {
  return challengeInstructions.challenges.find(({ name }) => name === challengeName) !== undefined
}

export async function startHackingInstructorFor (challengeName: String): Promise<void> {
  const challengeInstruction = challengeInstructions.challenges.find(({ name }) => name === challengeName)

  for (const hint of challengeInstruction.hints) {
    const element = loadHint(hint)
    element.scrollIntoView()

    await waitForClick(element)
    element.remove()
  }
}
