import { type EnrichedChallenge } from '../types/EnrichedChallenge'

import sortBy from 'lodash-es/sortBy'

export function sortChallenges (
  challenges: EnrichedChallenge[]
): EnrichedChallenge[] {
  return sortBy(challenges, ['difficulty', 'tutorialOrder', 'name'])
}
