import { EnrichedChallenge } from '../types/EnrichedChallenge'
import { FilterSetting, SolvedStatus } from '../types/FilterSetting'

export function filterChallenges (challenges: EnrichedChallenge[], filterSetting: FilterSetting): EnrichedChallenge[] {
  console.log('filterSetting.showDisabledChallenges', filterSetting.showDisabledChallenges)
    return challenges
      // filter by category
      .filter((challenge) => {
          if (filterSetting.categories.length === 0) {
              return true
            }
            return filterSetting.categories.includes(challenge.category)
        })
       // filter by difficulty
       .filter((challenge) => {
           if (filterSetting.difficulties.length === 0) {
               return true
            }
            return filterSetting.difficulties.includes(challenge.difficulty)
        })
       // filter by tags
       .filter((challenge) => {
           if (filterSetting.tags.length === 0) {
               return true
            }
            return challenge.tagList.some((tag) => filterSetting.tags.includes(tag))
      })
      // filter by status
      .filter((challenge) => {
        if (filterSetting.status === null) {
          return true
        }
        return filterSetting.status === getCompleteChallengeStatus(challenge)
      })
      // filter disabled challenges
      .filter((challenge) => {
        if (challenge.disabledEnv === null) {
          return true
        }
        return filterSetting.showDisabledChallenges
      })
      // filter by search query
      .filter((challenge) => {
        if (filterSetting.searchQuery === null) {
          return true
        }
        return challenge.name.toLowerCase().includes(filterSetting.searchQuery.toLowerCase()) ||
          challenge.originalDescription.toLowerCase().includes(filterSetting.searchQuery.toLowerCase())
      })
  }

function getCompleteChallengeStatus (challenge: EnrichedChallenge): SolvedStatus {
    if (!challenge.solved) {
      return 'unsolved'
    }

    if (!challenge.hasCodingChallenge) {
        return challenge.solved ? 'solved' : 'unsolved'
    } else {
        if (challenge.codingChallengeStatus === 2) {
          return 'solved'
        }
        return 'partially-solved'
    }
}
