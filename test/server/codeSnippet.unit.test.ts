import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getVerdict } from '../../routes/vulnCodeSnippet'

void describe('vulnCodeSnippet', () => {
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
