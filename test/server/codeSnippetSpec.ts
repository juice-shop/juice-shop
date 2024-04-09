import chai = require('chai')
import sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)
const { getVerdict } = require('../../routes/vulnCodeSnippet')

describe('vulnCodeSnippet', () => {
  it('should assert single correctly selected vuln line as correct', () => {
    expect(getVerdict([1], [], [1])).to.equal(true)
  })

  it('should assert multiple correctly selected vuln lines as correct in any order', () => {
    expect(getVerdict([1, 2], [], [1, 2])).to.equal(true)
    expect(getVerdict([1, 2], [], [2, 1])).to.equal(true)
    expect(getVerdict([1, 2, 3], [], [3, 1, 2])).to.equal(true)
  })

  it('should ignore selected neutral lines during correct assertion', () => {
    expect(getVerdict([1, 2], [3, 4], [1, 2, 3])).to.equal(true)
    expect(getVerdict([1, 2], [3, 4], [1, 2, 4])).to.equal(true)
    expect(getVerdict([1, 2], [3, 4], [1, 2, 3, 4])).to.equal(true)
  })

  it('should assert missing vuln lines as wrong', () => {
    expect(getVerdict([1, 2], [], [1])).to.equal(false)
    expect(getVerdict([1, 2], [], [2])).to.equal(false)
    expect(getVerdict([1, 2], [3], [2, 3])).to.equal(false)
    expect(getVerdict([1, 2], [3], [1, 3])).to.equal(false)
    expect(getVerdict([1, 2], [3, 4], [3, 4])).to.equal(false)
  })

  it('should assert additionally selected lines as wrong', () => {
    expect(getVerdict([1, 2], [], [1, 2, 3])).to.equal(false)
    expect(getVerdict([1, 2], [3], [1, 2, 3, 4])).to.equal(false)
  })

  it('should assert lack of selected lines as wrong', () => {
    expect(getVerdict([1, 2], [], [])).to.equal(false)
  })

  it('should assert empty edge case as correct', () => {
    expect(getVerdict([], [], [])).to.equal(true)
  })
})
