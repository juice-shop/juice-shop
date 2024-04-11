/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import snarkdown from 'snarkdown'

import { LoginAdminInstruction } from './challenges/loginAdmin'
import { DomXssInstruction } from './challenges/domXss'
import { ScoreBoardInstruction } from './challenges/scoreBoard'
import { PrivacyPolicyInstruction } from './challenges/privacyPolicy'
import { LoginJimInstruction } from './challenges/loginJim'
import { ViewBasketInstruction } from './challenges/viewBasket'
import { ForgedFeedbackInstruction } from './challenges/forgedFeedback'
import { PasswordStrengthInstruction } from './challenges/passwordStrength'
import { BonusPayloadInstruction } from './challenges/bonusPayload'
import { LoginBenderInstruction } from './challenges/loginBender'
import { TutorialUnavailableInstruction } from './tutorialUnavailable'
import { CodingChallengesInstruction } from './challenges/codingChallenges'

const challengeInstructions: ChallengeInstruction[] = [
  ScoreBoardInstruction,
  LoginAdminInstruction,
  LoginJimInstruction,
  DomXssInstruction,
  PrivacyPolicyInstruction,
  ViewBasketInstruction,
  ForgedFeedbackInstruction,
  PasswordStrengthInstruction,
  BonusPayloadInstruction,
  LoginBenderInstruction,
  CodingChallengesInstruction
]

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
   * Query Selector String of the Element the hint should be displayed next to.
   */
  fixture: string
  /**
   * Set to true if the hint should be displayed after the target
   * Defaults to false (hint displayed before target)
   */
  fixtureAfter?: boolean
  /**
   * Set to true if the hint should not be able to be skipped by clicking on it.
   * Defaults to false
   */
  unskippable?: boolean
  /**
   * Function declaring the condition under which the tutorial will continue.
   */
  resolved: () => Promise<void>
}

function loadHint (hint: ChallengeHint): HTMLElement {
  const target = document.querySelector(hint.fixture)

  if (!target) {
    return null as unknown as HTMLElement
  }

  const wrapper = document.createElement('div')
  wrapper.style.position = 'absolute'

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
  elem.style.top = '24px'
  elem.style.fontFamily = 'Roboto,Helvetica Neue,sans-serif'
  if (!hint.unskippable) {
    elem.style.cursor = 'pointer'
    elem.title = 'Double-click to skip'
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

  const cancelButton = document.createElement('button')
  cancelButton.id = 'cancelButton'
  cancelButton.style.textDecoration = 'none'
  cancelButton.style.backgroundColor = 'transparent'
  cancelButton.style.border = 'none'
  cancelButton.style.color = 'white'
  cancelButton.innerHTML = '<div style;">&times;</div>'
  cancelButton.style.fontSize = 'large'
  cancelButton.title = 'Cancel the tutorial'
  cancelButton.style.position = 'relative'
  cancelButton.style.zIndex = '20001'
  cancelButton.style.bottom = '-22px'
  cancelButton.style.cursor = 'pointer'

  elem.appendChild(picture)
  elem.appendChild(textBox)

  const relAnchor = document.createElement('div')
  relAnchor.style.position = 'relative'
  relAnchor.style.display = 'inline'
  relAnchor.appendChild(elem)
  relAnchor.appendChild(cancelButton)

  wrapper.appendChild(relAnchor)

  if (hint.fixtureAfter) {
    // insertAfter does not exist so we simulate it this way
    target.parentElement.insertBefore(wrapper, target.nextSibling)
  } else {
    target.parentElement.insertBefore(wrapper, target)
  }

  return wrapper
}

async function waitForDoubleClick (element: HTMLElement) {
  return await new Promise((resolve) => {
    element.addEventListener('dblclick', resolve)
  })
}

async function waitForCancel (element: HTMLElement) {
  return await new Promise((resolve) => {
    element.addEventListener('click', () => {
      resolve('break')
    })
  })
}

export function hasInstructions (challengeName: string): boolean {
  return challengeInstructions.find(({ name }) => name === challengeName) !== undefined
}

export async function startHackingInstructorFor (challengeName: string): Promise<void> {
  const challengeInstruction = challengeInstructions.find(({ name }) => name === challengeName) || TutorialUnavailableInstruction

  for (const hint of challengeInstruction.hints) {
    const element = loadHint(hint)
    if (!element) {
      console.warn(`Could not find Element with fixture "${hint.fixture}"`)
      continue
    }
    element.scrollIntoView()

    const continueConditions: Array<Promise<void | unknown>> = [
      hint.resolved()
    ]

    if (!hint.unskippable) {
      continueConditions.push(waitForDoubleClick(element))
    }
    continueConditions.push(waitForCancel(document.getElementById('cancelButton')))

    const command = await Promise.race(continueConditions)
    if (command === 'break') {
      element.remove()
      break
    }

    element.remove()
  }
}
