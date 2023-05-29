import { Challenge } from '../../Models/challenge.model'

export interface EnrichedChallenge extends Challenge {
tagList: string[]
difficultyAsList: number[]
hasCodingChallenge: boolean
}
