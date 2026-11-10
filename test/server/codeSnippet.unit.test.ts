import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import {
  getVerdict,
  retrieveCodeSnippet,
  retrieveChallengesWithCodeSnippet,
  serveCodeSnippet,
  checkVulnLines
} from '../../routes/vulnCodeSnippet'
import { ChallengeModel } from '../../models/challenge'
import { challenges } from '../../data/datacache'

void describe('vulnCodeSnippet', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = { params: {}, body: {} }
    res = {
      status: mock.fn(() => res),
      json: mock.fn(),
      __: mock.fn((s: string) => s)
    }
    next = mock.fn()
    challenges.weakPasswordChallenge = { key: 'weakPasswordChallenge', name: 'Weak Password', codingChallengeStatus: 0 } as any
    mock.method(ChallengeModel, 'update', async () => [1])
  })

  void describe('getVerdict', () => {
    void it('should assert single correctly selected vuln line as correct', () => {
      assert.equal(getVerdict([1], [], [1]), true)
    })

    void it('should assert multiple correctly selected vuln lines as correct in any order', () => {
      assert.equal(getVerdict([1, 2], [], [1, 2]), true)
      assert.equal(getVerdict([1, 2], [], [2, 1]), true)
      assert.equal(getVerdict([1, 2, 3], [], [3, 1, 2]), true)
    })

    void it('should ignore selected neutral lines during correct assertion', () => {
      assert.equal(getVerdict([1, 2], [3, 4], [1, 2, 3]), true)
      assert.equal(getVerdict([1, 2], [3, 4], [1, 2, 4]), true)
      assert.equal(getVerdict([1, 2], [3, 4], [1, 2, 3, 4]), true)
    })

    void it('should assert missing vuln lines as wrong', () => {
      assert.equal(getVerdict([1, 2], [], [1]), false)
      assert.equal(getVerdict([1, 2], [], [2]), false)
      assert.equal(getVerdict([1, 2], [3], [2, 3]), false)
      assert.equal(getVerdict([1, 2], [3], [1, 3]), false)
      assert.equal(getVerdict([1, 2], [3, 4], [3, 4]), false)
    })

    void it('should assert additionally selected lines as wrong', () => {
      assert.equal(getVerdict([1, 2], [], [1, 2, 3]), false)
      assert.equal(getVerdict([1, 2], [3], [1, 2, 3, 4]), false)
    })

    void it('should assert lack of selected lines as wrong', () => {
      assert.equal(getVerdict([1, 2], [], []), false)
    })

    void it('should assert empty edge case as correct', () => {
      assert.equal(getVerdict([], [], []), true)
    })
  })

  void describe('retrieveCodeSnippet', () => {
    void it('returns null when challenge snippet does not exist', async () => {
      const result = await retrieveCodeSnippet('unknownChallenge')
      assert.equal(result, null)
    })

    void it('returns snippet data when challenge snippet exists', async () => {
      const result = await retrieveCodeSnippet('weakPasswordChallenge')
      assert.ok(result)
      assert.ok(typeof result?.snippet === 'string')
    })
  })

  void describe('retrieveChallengesWithCodeSnippet', () => {
    void it('returns array of challenges that have snippets', async () => {
      const challenges = await retrieveChallengesWithCodeSnippet()
      assert.ok(Array.isArray(challenges))
      assert.ok(challenges.length > 0)
    })
  })

  void describe('serveCodeSnippet', () => {
    void it('returns 404 when snippet is not found', async () => {
      req.params.challenge = 'nonExistentChallenge'
      await serveCodeSnippet()(req, res, next)

      assert.equal(res.status.mock.calls[0].arguments[0], 404)
      assert.deepEqual(res.json.mock.calls[0].arguments[0], {
        status: 'error',
        error: 'No code challenge for challenge key: nonExistentChallenge'
      })
    })

    void it('returns 200 with snippet content when snippet is found', async () => {
      req.params.challenge = 'weakPasswordChallenge'
      await serveCodeSnippet()(req, res, next)

      assert.equal(res.status.mock.calls[0].arguments[0], 200)
      assert.ok(res.json.mock.calls[0].arguments[0].snippet)
    })
  })

  void describe('checkVulnLines', () => {
    void it('returns 404 when snippet for challenge key is not found', async () => {
      req.body.key = 'nonExistentKey'
      req.body.selectedLines = [1]

      await checkVulnLines()(req, res, next)

      assert.equal(res.status.mock.calls[0].arguments[0], 404)
    })

    void it('returns verdict true when correct vuln lines are submitted for snippet', async () => {
      const snippetData = await retrieveCodeSnippet('weakPasswordChallenge')
      req.body.key = 'weakPasswordChallenge'
      req.body.selectedLines = snippetData?.vulnLines

      await checkVulnLines()(req, res, next)

      assert.equal(res.status.mock.calls[0].arguments[0], 200)
      assert.equal(res.json.mock.calls[0].arguments[0].verdict, true)
    })

    void it('returns verdict false with hint when wrong lines are submitted', async () => {
      req.body.key = 'weakPasswordChallenge'
      req.body.selectedLines = [999]

      await checkVulnLines()(req, res, next)

      assert.equal(res.status.mock.calls[0].arguments[0], 200)
      assert.equal(res.json.mock.calls[0].arguments[0].verdict, false)
    })
  })
})
