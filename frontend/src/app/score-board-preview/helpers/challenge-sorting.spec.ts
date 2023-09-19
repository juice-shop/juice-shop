import { type EnrichedChallenge } from '../types/EnrichedChallenge'
import { sortChallenges } from './challenge-sorting'

const CHALLENGE_1 = {
  category: 'foobar',
  description: 'lorem ipsum',
  originalDescription: 'lorem ipsum',
  difficulty: 1,
  hasCodingChallenge: true,
  id: 1,
  key: 'challenge-1',
  mitigationUrl: 'https://owasp.example.com',
  name: 'challenge one',
  solved: false,
  codingChallengeStatus: 0,
  tagList: ['easy'],
  disabledEnv: null,
  tutorialOrder: 1
} as EnrichedChallenge

const CHALLENGE_2 = {
  category: 'foobar',
  description: 'lorem ipsum',
  originalDescription: 'lorem ipsum',
  difficulty: 1,
  hasCodingChallenge: true,
  id: 2,
  key: 'challenge-2',
  mitigationUrl: 'https://owasp.example.com',
  name: 'challenge two',
  solved: true,
  codingChallengeStatus: 2,
  tagList: ['easy'],
  disabledEnv: null,
  tutorialOrder: 2
} as EnrichedChallenge

const CHALLENGE_3 = {
  category: 'barfoo',
  description: 'lorem ipsum',
  originalDescription: 'lorem ipsum',
  difficulty: 6,
  hasCodingChallenge: true,
  id: 3,
  key: 'challenge-3',
  mitigationUrl: 'https://owasp.example.com',
  name: 'challenge three',
  solved: true,
  codingChallengeStatus: 1,
  tagList: ['hard'],
  disabledEnv: 'docker',
  tutorialOrder: null
} as EnrichedChallenge

describe('sortChallenges', () => {
  it('sort tutorial challenges correctly', () => {
    expect(sortChallenges([CHALLENGE_1, CHALLENGE_2]).map(challenge => challenge.key)).toEqual(['challenge-1', 'challenge-2'])
    expect(sortChallenges([CHALLENGE_2, CHALLENGE_1]).map(challenge => challenge.key)).toEqual(['challenge-1', 'challenge-2'])
    for (const challengeOrderingCombination of [
      [CHALLENGE_1, CHALLENGE_2],
      [CHALLENGE_2, CHALLENGE_1]
    ]) {
      expect(sortChallenges(challengeOrderingCombination).map(challenge => challenge.key)).toEqual(['challenge-1', 'challenge-2'])
    }
  })

  it('sort non tutorial challenges by difficulty while still maintaining tutorial order for challenges with tutorials', () => {
    for (const challengeOrderingCombination of [
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      [CHALLENGE_1, CHALLENGE_3, CHALLENGE_2],
      [CHALLENGE_2, CHALLENGE_1, CHALLENGE_3],
      [CHALLENGE_2, CHALLENGE_3, CHALLENGE_1],
      [CHALLENGE_3, CHALLENGE_1, CHALLENGE_2],
      [CHALLENGE_3, CHALLENGE_2, CHALLENGE_1]
    ]) {
      expect(sortChallenges(challengeOrderingCombination).map(challenge => challenge.key)).toEqual(['challenge-1', 'challenge-2', 'challenge-3'])
    }
  })
})
