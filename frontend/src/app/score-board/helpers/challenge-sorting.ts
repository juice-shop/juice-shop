import { type EnrichedChallenge } from '../types/EnrichedChallenge'

export function sortChallenges (
  challenges: EnrichedChallenge[]
): EnrichedChallenge[] {
  return [...challenges].sort((a, b) => {
    if (a.difficulty !== b.difficulty) {
      return a.difficulty - b.difficulty
    }
    if (a.tutorialOrder !== b.tutorialOrder) {
      if (a.tutorialOrder == null) return 1
      if (b.tutorialOrder == null) return -1
      return a.tutorialOrder - b.tutorialOrder
    }
    return a.name.localeCompare(b.name)
  })
}
