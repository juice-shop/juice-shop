// @ts-ignore
import snarkdown from 'snarkdown' // TODO Remove ts-ignore when https://github.com/developit/snarkdown/pull/74 is merged

import { LoginAdminInstruction } from './challenges/loginAdmin'
import { DomXssInstruction } from './challenges/localXss'
import { ScoreBoardInstruction } from './challenges/scoreBoard'

const challengeInstructions: ChallengeInstruction[] = [
  ScoreBoardInstruction,
  LoginAdminInstruction,
  DomXssInstruction
]

export interface HackingInstructorFileFormat {
  challenges: ChallengeInstruction[]
}

export interface ChallengeInstruction {
  name: string
  hints: ChallengeHint[]
}

export interface ChallengeHint {
  /**
   * Text in the hint box
   * Can be formatted using markdown
   */
  text: string
  /**
   * Query Selector String of the Element the Hint should be displayed next to.
   */
  fixture: string
  resolved: () => Promise<void>
  /**
   * Set to true if the hint should not be able to be skipped by clicking on it.
   * Defaults to false
   */
  unskippable?: boolean
}

function loadHint (hint: ChallengeHint): HTMLElement {
  const target = document.querySelector(hint.fixture)

  if (!target) {
    return null as unknown as HTMLElement
  }

  const elem = document.createElement('div')
  elem.id = 'hacking-instructor'
  elem.style.position = 'absolute'
  elem.style.zIndex = '20000'
  elem.style.backgroundColor = 'rgba(50, 115, 220, 0.9)'
  elem.style.maxWidth = '400px'
  elem.style.minWidth = hint.text.length > 100 ? '350px' : '250px'
  elem.style.padding = '16px'
  elem.style.borderRadius = '8px'
  elem.style.whiteSpace = 'initial'
  elem.style.lineHeight = '1.3'
  elem.style.top = `24px`
  if (hint.unskippable !== true) {
    elem.style.cursor = 'pointer'
  }
  elem.style.fontSize = '14px'
  elem.style.display = 'flex'
  elem.style.alignItems = 'center'

  const picture = document.createElement('img')
  picture.style.minWidth = '64px'
  picture.style.minHeight = '64px'
  picture.style.width = '64px'
  picture.style.height = '64px'
  picture.style.marginRight = '8px'
  picture.src = '/assets/public/images/hackingInstructor.png'

  const textBox = document.createElement('span')
  textBox.style.flexGrow = '2'
  textBox.innerHTML = snarkdown(hint.text)

  elem.appendChild(picture)
  elem.appendChild(textBox)

  const relAnchor = document.createElement('div')
  relAnchor.style.position = 'relative'
  relAnchor.style.display = 'inline'
  relAnchor.appendChild(elem)

  target.parentElement!.insertBefore(relAnchor, target)

  return relAnchor
}

function waitForClick (element: HTMLElement) {
  return new Promise((resolve) => {
    element.addEventListener('click', resolve)
  })
}

export function hasInstructions (challengeName: String): boolean {
  return challengeInstructions.find(({ name }) => name === challengeName) !== undefined
}

export async function startHackingInstructorFor (challengeName: String): Promise<void> {
  const challengeInstruction = challengeInstructions.find(({ name }) => name === challengeName)

  for (const hint of challengeInstruction!.hints) {
    const element = loadHint(hint)
    if (!element) {
      console.warn(`Could not find Element with fixture "${hint.fixture}"`)
      continue
    }
    element.scrollIntoView()

    const continueConditions: Promise<void | {}>[] = [
      hint.resolved()
    ]

    if (hint.unskippable !== true) {
      continueConditions.push(waitForClick(element))
    }

    await Promise.race(continueConditions)

    element.remove()
  }
}
