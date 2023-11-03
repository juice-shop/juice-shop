import { type EnrichedChallenge } from '../types/EnrichedChallenge'
import { type FilterSetting, type SolvedStatus } from '../filter-settings/FilterSetting'

export function filterChallenges (
  challenges: EnrichedChallenge[],
  filterSetting: FilterSetting
): EnrichedChallenge[] {
  return (
    challenges
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
        return challenge.tagList.some((tag) =>
          filterSetting.tags.includes(tag)
        )
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
        return (
          challenge.name
            .toLowerCase()
            .includes(filterSetting.searchQuery.toLowerCase()) ||
          challenge.originalDescription
            .toLowerCase()
            .includes(filterSetting.searchQuery.toLowerCase())
        )
      })
      // filter by tutorial challenges
      .filter((challenge) => {
        if (!filterSetting.restrictToTutorialChallengesFirst) {
          return true
        }

        const tutorialChallenges = challenges.filter(
          (challenge) => challenge.tutorialOrder !== null
        )
        const allTutorialChallengesSolved = tutorialChallenges.every((challenge) => challenge.solved)

        if (allTutorialChallengesSolved) {
          return true
        } else if (!allTutorialChallengesSolved && challenge.tutorialOrder === null) {
          // there are still unsolved tutorial challenges, but this challenge is not a tutorial challenge so we don't want to show it
          return false
        }

        // find --include difficulty of unsolved tutorial challenges, we only want to show ones matching it or easier
        const difficultiesOfUnsolvedTutorialChallenges = tutorialChallenges
          .filter((challenge) => !challenge.solved)
          .map((challenge) => challenge.difficulty)
        const easiestDifficultyOfUnsolvedTutorialChallenges = Math.min(...difficultiesOfUnsolvedTutorialChallenges)

        if (challenge.difficulty <= easiestDifficultyOfUnsolvedTutorialChallenges) {
          return true
        }
        return false
      })
  )
}

function getCompleteChallengeStatus (
  challenge: EnrichedChallenge
): SolvedStatus {
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
