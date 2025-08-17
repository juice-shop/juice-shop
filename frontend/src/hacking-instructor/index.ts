/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
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
import { AdminSectionInstruction } from './challenges/adminSection'
import { ReflectedXssInstruction } from './challenges/reflectedXss'
import { ExposedCredentialsInstruction } from './challenges/exposedCredentials'

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
  CodingChallengesInstruction,
  AdminSectionInstruction,
  ReflectedXssInstruction,
  ExposedCredentialsInstruction
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

function createElement (tag: string, styles: Record<string, string>, attributes: Record<string, string> = {}): HTMLElement {
  const element = document.createElement(tag)
  Object.assign(element.style, styles)
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value)
  }
  return element
}

function loadHint (hint: ChallengeHint): HTMLElement {
  const target = document.querySelector(hint.fixture)

  if (!target) {
    return null as unknown as HTMLElement
  }

  const wrapper = createElement('div', { position: 'absolute' })

  const elemStyles = {
    position: 'absolute',
    zIndex: '20000',
    backgroundColor: 'rgba(50, 115, 220, 0.9)',
    maxWidth: '400px',
    minWidth: hint.text.length > 100 ? '350px' : '250px',
    padding: '16px',
    borderRadius: '8px',
    whiteSpace: 'initial',
    lineHeight: '1.3',
    top: '24px',
    fontFamily: 'Roboto,Helvetica Neue,sans-serif',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    cursor: hint.unskippable ? 'default' : 'pointer',
    animation: 'flash 0.2s'
  }

  const elem = createElement('div', elemStyles, { id: 'hacking-instructor', title: hint.unskippable ? '' : 'Double-click to skip' })

  const pictureStyles = {
    minWidth: '64px',
    minHeight: '64px',
    width: '64px',
    height: '64px',
    marginRight: '8px'
  }

  const picture = createElement('img', pictureStyles, { src: '/assets/public/images/hackingInstructor.png' })

  const textBox = createElement('span', { flexGrow: '2' })
  textBox.innerHTML = snarkdown(hint.text)

  const cancelButtonStyles = {
    textDecoration: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: 'large',
    position: 'relative',
    zIndex: '20001',
    top: '32px',
    left: '5px',
    cursor: 'pointer'
  }

  const cancelButton = createElement('button', cancelButtonStyles, { id: 'cancelButton', title: 'Cancel the tutorial' })
  cancelButton.innerHTML = '<div>&times;</div>'

  elem.appendChild(picture)
  elem.appendChild(textBox)

  const relAnchor = createElement('div', { position: 'relative', display: 'inline' })
  relAnchor.appendChild(elem)
  relAnchor.appendChild(cancelButton)

  wrapper.appendChild(relAnchor)

  if (hint.fixtureAfter) {
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

function isElementInViewport (el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

export async function startHackingInstructorFor (challengeName: string): Promise<void> {
  const challengeInstruction = challengeInstructions.find(({ name }) => name === challengeName) ?? TutorialUnavailableInstruction

  for (const hint of challengeInstruction.hints) {
    const element = loadHint(hint)
    if (!element) {
      console.warn(`Could not find Element with fixture "${hint.fixture}"`)
      continue
    }

    if (!isElementInViewport(element)) {
      element.scrollIntoView()
    }

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
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
