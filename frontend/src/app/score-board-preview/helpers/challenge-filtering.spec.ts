import { EnrichedChallenge } from '../types/EnrichedChallenge'
import { filterChallenges } from './challenge-filtering'

const CHALLENGE_1 = {
  category: 'foobar',
  description: 'lorem ipsum',
  difficulty: 1,
  difficultyAsList: [1],
  hasCodingChallenge: true,
  id: 1,
  key: 'challenge-1',
  mitigationUrl: 'https://owasp.example.com',
  name: 'challenge one',
  solved: false,
  tagList: ['easy']
} as EnrichedChallenge

const CHALLENGE_2 = {
  category: 'foobar',
  description: 'lorem ipsum',
  difficulty: 3,
  difficultyAsList: [1, 2, 3],
  hasCodingChallenge: true,
  id: 2,
  key: 'challenge-2',
  mitigationUrl: 'https://owasp.example.com',
  name: 'challenge two',
  solved: true,
  tagList: ['easy']
} as EnrichedChallenge

const CHALLENGE_3 = {
  category: 'barfoo',
  description: 'lorem ipsum',
  difficulty: 6,
  difficultyAsList: [1, 2, 3, 4, 5, 6],
  hasCodingChallenge: true,
  id: 3,
  key: 'challenge-3',
  mitigationUrl: 'https://owasp.example.com',
  name: 'challenge three',
  solved: false,
  tagList: ['hard']
} as EnrichedChallenge

describe('filterChallenges', () => {
  it('should filter empty list', () => {
    expect(filterChallenges([], { categories: new Set(), difficulties: [], tags: [], status: null })).toEqual([])
    expect(filterChallenges([], { categories: new Set(['foo', 'bar']), difficulties: [1, 2, 3, 5, 6], tags: ['hard'], status: 'solved' })).toEqual([])
  })

  it('should filter challenges based on categories properly', () => {
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { categories: new Set(['foobar']), difficulties: [], tags: [], status: null }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1', 'challenge-2']))
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { categories: new Set(['barfoo']), difficulties: [], tags: [], status: null }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-3']))
  })

  it('should filter challenges based on difficulties properly', () => {
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { categories: new Set(), difficulties: [1, 6], tags: [], status: null }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1', 'challenge-3']))
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { categories: new Set(), difficulties: [3], tags: [], status: null }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-2']))
  })

  it('should filter challenges based on tags properly', () => {
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { categories: new Set(), difficulties: [], tags: ['easy'], status: null }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1', 'challenge-2']))
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { categories: new Set(), difficulties: [], tags: ['hard'], status: null }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-3']))
  })

  it('should filter challenges based on tags properly', () => {
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { categories: new Set(), difficulties: [], tags: [], status: 'solved' }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-2']))
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { categories: new Set(), difficulties: [], tags: [], status: 'unsolved' }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1', 'challenge-3']))
  })
})
