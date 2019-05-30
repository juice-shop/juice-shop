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
  fixture: {
    type: string;
    value: string;
  }
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
          fixture: {
            type: 'id',
            value: 'navbarLoginButton'
          },
          position: 'right'
        },
        {
          text: "Try to log in with ' as email and anything in the password field.",
          page: 'login',
          fixture: {
            type: 'id',
            value: 'email'
          },
          position: 'right'
        },
        {
          text: 'Now put anything in the password field.',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'password'
          },
          position: 'right'
        },
        {
          text: 'Press the log in button',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'loginButton'
          },
          position: 'right'
        },
        {
          text: 'Nice! Do you see the error? Maybe you could check the console output ;)',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'loginButton'
          },
          position: 'right'
        },
        {
          text: 'Did you spot the SQL query in the error message? If not, take a look again.',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'loginButton'
          },
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
  elem.innerText = hint.text

  const target = document.getElementById(hint.fixture.value)

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

export async function init () {
  console.log('Hacking Instructor Init')

  for (const hint of challengeInstructions.challenges[0].hints) {
    const element = loadHint(hint)
    element.scrollIntoView()

    await waitForClick(element)
    element.remove()
  }
}
