import { EnrichedChallenge } from '../types/EnrichedChallenge'
import { FilterSetting } from '../types/FilterSetting'

export function filterChallenges (challenges: EnrichedChallenge[], filterSetting: FilterSetting): EnrichedChallenge[] {
    return challenges
      // filter by category
      .filter((challenge) => {
          if (filterSetting.categories.size === 0) {
              return true
            }
            return filterSetting.categories.has(challenge.category)
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
        if (filterSetting.status === 'solved') {
          return challenge.solved
        }
        if (filterSetting.status === 'unsolved') {
          return !challenge.solved
        }
        return true
      })
  }
