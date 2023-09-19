import { type Challenge } from '../../Models/challenge.model'

export interface EnrichedChallenge extends Challenge {
  originalDescription: string
  tagList: string[]
  hasCodingChallenge: boolean
}
