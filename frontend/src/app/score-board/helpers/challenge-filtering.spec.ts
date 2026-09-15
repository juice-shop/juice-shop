import { type EnrichedChallenge } from '../types/EnrichedChallenge'
import { DEFAULT_FILTER_SETTING } from '../filter-settings/FilterSetting'
import { filterChallenges, EXTERNAL_DEPENDENCY_TAG } from './challenge-filtering'

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
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, categories: ['foobar'] }).map((challenge) => challenge.key)).toHaveLength(2)
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, categories: ['foobar'] }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-1', 'challenge-2']))
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, categories: ['barfoo'] }).map((challenge) => challenge.key)).toHaveLength(1)
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, categories: ['barfoo'] }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-3']))
    })

    it('should filter challenges based on difficulties properly', () => {
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, difficulties: [1, 6] }).map((challenge) => challenge.key)).toHaveLength(2)
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, difficulties: [1, 6] }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-1', 'challenge-3']))
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, difficulties: [3] }).map((challenge) => challenge.key)).toHaveLength(1)
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, difficulties: [3] }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-2']))
    })

    it('should filter challenges based on tags properly', () => {
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, tags: ['easy'] }).map((challenge) => challenge.key)).toHaveLength(2)
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, tags: ['easy'] }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-1', 'challenge-2']))
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, tags: ['hard'] }).map((challenge) => challenge.key)).toHaveLength(1)
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, tags: ['hard'] }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-3']))
    })

    it('should filter challenges with "External Dependency" tag matching any "Requires ..." tag', () => {
        const challengeWithRequires = {
            ...CHALLENGE_1,
            key: 'challenge-requires',
            tagList: ['easy', 'Requires SMTP']
        } as EnrichedChallenge
        const challengeWithOtherRequires = {
            ...CHALLENGE_2,
            key: 'challenge-requires-2',
            tagList: ['Requires OAuth']
        } as EnrichedChallenge
        const challengeWithoutRequires = {
            ...CHALLENGE_3,
            tagList: ['hard']
        } as EnrichedChallenge
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.

        expect(filterChallenges([challengeWithRequires, challengeWithOtherRequires, challengeWithoutRequires], { ...DEFAULT_FILTER_SETTING, tags: [EXTERNAL_DEPENDENCY_TAG] }).map((challenge) => challenge.key)).toHaveLength(2)

        expect(filterChallenges([challengeWithRequires, challengeWithOtherRequires, challengeWithoutRequires], { ...DEFAULT_FILTER_SETTING, tags: [EXTERNAL_DEPENDENCY_TAG] }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-requires', 'challenge-requires-2']))
    })

    it('should allow combining "External Dependency" with other tags', () => {
        const challengeWithRequires = {
            ...CHALLENGE_1,
            key: 'challenge-requires',
            tagList: ['Requires SMTP']
        } as EnrichedChallenge
        const challengeWithHardTag = {
            ...CHALLENGE_3,
            key: 'challenge-hard',
            tagList: ['hard']
        } as EnrichedChallenge
        const challengeWithEasyTag = {
            ...CHALLENGE_2,
            key: 'challenge-easy',
            tagList: ['easy']
        } as EnrichedChallenge
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.

        expect(filterChallenges([challengeWithRequires, challengeWithHardTag, challengeWithEasyTag], { ...DEFAULT_FILTER_SETTING, tags: [EXTERNAL_DEPENDENCY_TAG, 'hard'] }).map((challenge) => challenge.key)).toHaveLength(2)

        expect(filterChallenges([challengeWithRequires, challengeWithHardTag, challengeWithEasyTag], { ...DEFAULT_FILTER_SETTING, tags: [EXTERNAL_DEPENDENCY_TAG, 'hard'] }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-requires', 'challenge-hard']))
    })

    it('should filter challenges based on status properly', () => {
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, status: 'solved' }).map((challenge) => challenge.key)).toHaveLength(1)
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, status: 'solved' }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-2']))
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, status: 'unsolved' }).map((challenge) => challenge.key)).toHaveLength(1)
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, status: 'unsolved' }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-1']))
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, status: 'partially-solved' }).map((challenge) => challenge.key)).toHaveLength(1)
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, status: 'partially-solved' }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-3']))
    })

    it('should filter challenges based on searchQuery properly', () => {
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, searchQuery: 'lorem' }).map((challenge) => challenge.key)).toHaveLength(3)
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, searchQuery: 'lorem' }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-1', 'challenge-2', 'challenge-3']))
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, searchQuery: 'challenge three' }).map((challenge) => challenge.key)).toHaveLength(1)
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, searchQuery: 'challenge three' }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-3']))
    })

    it('should filter challenges based on disabled setting properly', () => {
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, showDisabledChallenges: true }).map((challenge) => challenge.key)).toHaveLength(3)
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, showDisabledChallenges: true }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-1', 'challenge-2', 'challenge-3']))
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, showDisabledChallenges: false }).map((challenge) => challenge.key)).toHaveLength(2)
        expect(filterChallenges([CHALLENGE_1, CHALLENGE_2, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, showDisabledChallenges: false }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-1', 'challenge-2']))
    })

    it('should only show unsolved tutorial of first difficulty if no challenges are solved', () => {
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, { ...CHALLENGE_2, solved: false }, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, restrictToTutorialChallengesFirst: true }).map((challenge) => challenge.key)).toHaveLength(1)
        expect(filterChallenges([CHALLENGE_1, { ...CHALLENGE_2, solved: false }, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, restrictToTutorialChallengesFirst: true }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-1']))
    })

    it('should only show tutorial challenges when restrictToTutorialChallengesFirst is set', () => {
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([CHALLENGE_1, { ...CHALLENGE_2, solved: false, difficulty: 1, tutorialOrder: null }, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, restrictToTutorialChallengesFirst: true }).map((challenge) => challenge.key)).toHaveLength(1)
        expect(filterChallenges([CHALLENGE_1, { ...CHALLENGE_2, solved: false, difficulty: 1, tutorialOrder: null }, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, restrictToTutorialChallengesFirst: true }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-1']))
    })

    it('should only show unsolved tutorial of first difficulty and solved ones of easier difficulties', () => {
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([{ ...CHALLENGE_1, solved: true }, { ...CHALLENGE_2, solved: false }, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, restrictToTutorialChallengesFirst: true }).map((challenge) => challenge.key)).toHaveLength(2)
        expect(filterChallenges([{ ...CHALLENGE_1, solved: true }, { ...CHALLENGE_2, solved: false }, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, restrictToTutorialChallengesFirst: true }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-1', 'challenge-2']))
    })

    it('should only show ignore tutorial mode when all tutorial challenges are solved', () => {
        // TODO: vitest-migration: Verify this matches strict array content (multiset equality). Vitest's arrayContaining is a subset check.
        expect(filterChallenges([{ ...CHALLENGE_1, solved: true }, { ...CHALLENGE_2, solved: true }, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, restrictToTutorialChallengesFirst: true }).map((challenge) => challenge.key)).toHaveLength(3)
        expect(filterChallenges([{ ...CHALLENGE_1, solved: true }, { ...CHALLENGE_2, solved: true }, CHALLENGE_3], { ...DEFAULT_FILTER_SETTING, restrictToTutorialChallengesFirst: true }).map((challenge) => challenge.key)).toEqual(expect.arrayContaining(['challenge-1', 'challenge-2', 'challenge-3']))
    })
})
