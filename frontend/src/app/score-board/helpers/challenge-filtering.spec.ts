import { type EnrichedChallenge } from '../types/EnrichedChallenge'
import { DEFAULT_FILTER_SETTING } from '../filter-settings/FilterSetting'
import { filterChallenges } from './challenge-filtering'

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
  difficulty: 3,
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

describe('filterChallenges', () => {
  it('should filter empty list', () => {
    expect(filterChallenges([], { ...DEFAULT_FILTER_SETTING })).toEqual([])
    expect(filterChallenges([], { categories: ['foo', 'bar'], difficulties: [1, 2, 3, 5, 6], tags: ['hard'], status: 'solved', searchQuery: 'foobar', showDisabledChallenges: true, restrictToTutorialChallengesFirst: true })).toEqual([])
  })

  it('should filter challenges based on categories properly', () => {
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, categories: ['foobar'] }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1', 'challenge-2']))
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, categories: ['barfoo'] }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-3']))
  })

  it('should filter challenges based on difficulties properly', () => {
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, difficulties: [1, 6] }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1', 'challenge-3']))
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, difficulties: [3] }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-2']))
  })

  it('should filter challenges based on tags properly', () => {
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, tags: ['easy'] }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1', 'challenge-2']))
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, tags: ['hard'] }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-3']))
  })

  it('should filter challenges based on status properly', () => {
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, status: 'solved' }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-2']))
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, status: 'unsolved' }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1']))
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, status: 'partially-solved' }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-3']))
  })

  it('should filter challenges based on searchQuery properly', () => {
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, searchQuery: 'lorem' }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1', 'challenge-2', 'challenge-3']))
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, searchQuery: 'challenge three' }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-3']))
  })

  it('should filter challenges based on disabled setting properly', () => {
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, showDisabledChallenges: true }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1', 'challenge-2', 'challenge-3']))
    expect(filterChallenges(
      [CHALLENGE_1, CHALLENGE_2, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, showDisabledChallenges: false }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1', 'challenge-2']))
  })

  it('should only show unsolved tutorial of first difficulty if no challenges are solved', () => {
    expect(filterChallenges(
      [CHALLENGE_1, { ...CHALLENGE_2, solved: false }, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, restrictToTutorialChallengesFirst: true }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1']))
  })

  it('should only show tutorial challenges when restrictToTutorialChallengesFirst is set', () => {
    expect(filterChallenges(
      [CHALLENGE_1, { ...CHALLENGE_2, solved: false, difficulty: 1, tutorialOrder: null }, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, restrictToTutorialChallengesFirst: true }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1']))
  })

  it('should only show unsolved tutorial of first difficulty and solved ones of easier difficulties', () => {
    expect(filterChallenges(
      [{ ...CHALLENGE_1, solved: true }, { ...CHALLENGE_2, solved: false }, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, restrictToTutorialChallengesFirst: true }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1', 'challenge-2']))
  })

  it('should only show ignore tutorial mode when all tutorial challenges are solved', () => {
    expect(filterChallenges(
      [{ ...CHALLENGE_1, solved: true }, { ...CHALLENGE_2, solved: true }, CHALLENGE_3],
      { ...DEFAULT_FILTER_SETTING, restrictToTutorialChallengesFirst: true }
    ).map((challenge) => challenge.key)).toEqual(jasmine.arrayWithExactContents(['challenge-1', 'challenge-2', 'challenge-3']))
  })
})
