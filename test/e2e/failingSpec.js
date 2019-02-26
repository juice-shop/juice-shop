describe('Fail on purpose to test #823 fix', () => {
  it('should let the e2e stage fail on Travis-CI', () => {
    expect(false).toBeTruthy()
  })
})
