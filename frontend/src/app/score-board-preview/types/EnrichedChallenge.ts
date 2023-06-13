import { Challenge } from '../../Models/challenge.model'

export interface EnrichedChallenge extends Challenge {
  originalDescription: string
  tagList: string[]
  difficultyAsList: number[]
  hasCodingChallenge: boolean
}
