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
  resolved: () => Promise<void>
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
          position: 'right',
          async resolved() {
            while (true) {
              console.log(window.location.hash)
              if (window.location.hash === '#/login') {
                break
              }
              await sleep(100)
            }
          }
        },
        {
          text: "Try to log in with ' as email and anything in the password field.",
          page: 'login',
          fixture: {
            type: 'id',
            value: 'email'
          },
          position: 'right',
          async resolved() {
            const email = document.getElementById(
              'email'
            ) as HTMLInputElement

            while (true) {
              if (email.value === "'") {
                break
              }
              await sleep(100)
            }
          }
        },
        {
          text: 'Now put anything in the password field.',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'password'
          },
          position: 'right',
          async resolved() {
            const password = document.getElementById(
              'password'
            ) as HTMLInputElement

            while (true) {
              if (password.value !== '') {
                break
              }
              await sleep(100)
            }
          }
        },
        {
          text: 'Press the log in button',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'loginButton'
          },
          position: 'right',
          resolved() {
            const loginButton = document.getElementById(
              'loginButton'
            ) as HTMLButtonElement

            return new Promise((resolve) => {
              loginButton.addEventListener('click', () => resolve())
            })
          }
        },
        {
          text: 'Nice! Do you see the error? Maybe you could check the console output ;)',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'loginButton'
          },
          position: 'right',
          async resolved() {
            await sleep(5000)
          }
        },
        {
          text: 'Did you spot the SQL query in the error message? If not, take a look again.',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'loginButton'
          },
          position: 'right',
          async resolved() {
            await sleep(5000)
          }
        },
        {
          text: "Let's try to manipulate the query a bit more. Try out tryping \"' OR true\” into the email field.",
          page: 'login',
          fixture: {
            type: 'id',
            value: 'email'
          },
          position: 'right',
          async resolved() {
            const email = document.getElementById(
              'email'
            ) as HTMLInputElement

            while (true) {
              if (email.value === "' OR true") {
                break
              }
              await sleep(100)
            }
          }
        },
        {
          text: 'Press the log in button',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'loginButton'
          },
          position: 'right',
          resolved() {
            const loginButton = document.getElementById(
              'loginButton'
            ) as HTMLButtonElement

            return new Promise((resolve) => {
              loginButton.addEventListener('click', () => resolve())
            })
          }
        },
        {
          text: 'Mhh the query is still failing? Do you see why?',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'loginButton'
          },
          position: 'right',
          async resolved() {
            await sleep(5000)
          }
        },
        {
          text: 'We need to make sure that the rest of the query after our injection doesnt get executed. Any Ideas?',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'loginButton'
          },
          position: 'right',
          async resolved() {
            await sleep(5000)
          }
        },
        {
          text: 'You can comment out the rest of the quries using comments in sql. In sqlite you can use "--" for that',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'loginButton'
          },
          position: 'right',
          async resolved() {
            await sleep(5000)
          }
        },
        {
          text: 'So type in "\' OR true --" in the email field.',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'email'
          },
          position: 'right',
          async resolved() {
            const email = document.getElementById(
              'email'
            ) as HTMLInputElement

            while (true) {
              if (email.value === "' OR true --") {
                break
              }
              await sleep(100)
            }
          }
        },
        {
          text: 'Press the log in button',
          page: 'login',
          fixture: {
            type: 'id',
            value: 'loginButton'
          },
          position: 'right',
          resolved() {
            const loginButton = document.getElementById(
              'loginButton'
            ) as HTMLButtonElement

            return new Promise((resolve) => {
              loginButton.addEventListener('click', () => resolve())
            })
          }
        },
        {
          text:
            'That worked right?! Concratulation on being the new administartor in the shop!.',
          page: 'score-board',
          fixture: {
            type: 'id',
            value: 'searchQuery'
          },
          position: 'right',
          async resolved() {
            await sleep(5000)
          }
        }
      ]
    }
  ]
}

function loadHint(hint: ChallengeHint): HTMLElement {
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

const sleep = ms =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms)
  })

export async function init() {
  console.log('Hacking Instructor Init')

  for (const hint of challengeInstructions.challenges[0].hints) {
    console.log('hint=')
    console.log(hint)
    const element = loadHint(hint)
    element.scrollIntoView()

    await hint.resolved()
    element.remove()
  }
}
