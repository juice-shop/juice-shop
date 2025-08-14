import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { safeLoad } from 'js-yaml'
import logger from '../lib/logger'
import { type ChallengeKey } from 'models/challenge'

export async function loadStaticData (file: string) {
  const filePath = path.resolve('./data/static/' + file + '.yml')
  return await readFile(filePath, 'utf8')
    .then(safeLoad)
    .catch(() => logger.error('Could not open file: "' + filePath + '"'))
}

export interface StaticUser {
  email: string
  password: string
  key: string
  role: 'admin' | 'customer' | 'deluxe' | 'accounting'

  username?: string
  profileImage?: string
  walletBalance?: number
  lastLoginIp?: string
  deletedFlag?: boolean
  totpSecret?: string
  customDomain?: boolean
  securityQuestion?: StaticUserSecurityQuestion
  feedback?: StaticUserFeedback
  address?: StaticUserAddress[]
  card?: StaticUserCard[]
}
export interface StaticUserSecurityQuestion {
  id: number
  answer: string
}
export interface StaticUserFeedback {
  comment: string
  rating: 1 | 2 | 3 | 4 | 5
}
export interface StaticUserAddress {
  fullName: string
  mobileNum: number
  zipCode: string
  streetAddress: string
  city: string
  state: string
  country: string
}
export interface StaticUserCard {
  fullName: string
  cardNum: number
  expMonth: number
  expYear: number
}
export async function loadStaticUserData (): Promise<StaticUser[]> {
  return await loadStaticData('users') as StaticUser[]
}

export interface StaticChallenge {
  name: string
  category: string
  tags?: string[]
  description: string
  difficulty: number
  hint: string
  hintUrl: string
  hints: string[]
  mitigationUrl: string
  key: ChallengeKey
  disabledEnv?: string[]
  tutorial?: {
    order: number
  }
}
export async function loadStaticChallengeData (): Promise<StaticChallenge[]> {
  return await loadStaticData('challenges') as StaticChallenge[]
}

export interface StaticDelivery {
  name: string
  price: number
  deluxePrice: number
  eta: number
  icon: string
}
export async function loadStaticDeliveryData (): Promise<StaticDelivery[]> {
  return await loadStaticData('deliveries') as StaticDelivery[]
}

export interface StaticSecurityQuestions {
  question: string
}
export async function loadStaticSecurityQuestionsData (): Promise<StaticSecurityQuestions[]> {
  return await loadStaticData('securityQuestions') as StaticSecurityQuestions[]
}
