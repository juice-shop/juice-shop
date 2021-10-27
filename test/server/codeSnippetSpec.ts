import chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)
const { getVerdict } = require('../../routes/vulnCodeSnippet')

describe('vulnCodeSnippet', () => {
  it('should check for identical arrays', () => {
    expect(getVerdict([], [])).to.equal(true)
    expect(getVerdict([1, 1], [1, 1])).to.equal(true)
    expect(getVerdict([1, 2, 2], [2, 2, 1])).to.equal(true)
    expect(getVerdict([2, 1], [1, 2])).to.equal(true)
    expect(getVerdict([2, 2, 1], [1, 1, 2])).to.equal(false)
    expect(getVerdict([2, 3, 1], [1, 4, 6])).to.equal(false)
    expect(getVerdict([], [1])).to.equal(false)
  })
})
