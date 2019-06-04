import { SqlOneInstructions } from './challenges/sqli-1'

const challengeInstructions: [ChallengeInstruction] = [
  SqlOneInstructions
]

export interface HackingInstructorFileFormat {
  challenges: ChallengeInstruction[]
}

export interface ChallengeInstruction {
  name: string
  hints: ChallengeHint[]
}

export interface ChallengeHint {
  text: string
  /**
   * Query Selector String of the Element the Hint should be displayed next to.
   */
  fixture: string
  resolved: () => Promise<void>
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
  elem.style.fontSize = '14px'
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
  return challengeInstructions.find(({ name }) => name === challengeName) !== undefined
}

export async function startHackingInstructorFor (challengeName: String): Promise<void> {
  const challengeInstruction = challengeInstructions.find(({ name }) => name === challengeName)

  for (const hint of challengeInstruction.hints) {
    const element = loadHint(hint)
    element.scrollIntoView()

    await Promise.race([ hint.resolved(), waitForClick(element)])

    element.remove()
  }
}
