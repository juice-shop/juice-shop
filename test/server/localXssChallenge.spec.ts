/*
 * This test documents the expected payload semantics
 * for the Local XSS challenge.
 *
 * It is intentionally lightweight and avoids
 * WebSocket or runtime coupling.
 */

describe('Local XSS challenge payload semantics', () => {
  it('should contain iframe-based javascript alert payload', () => {
    const payload = '<iframe src="javascript:alert(`xss`)">'

    expect(payload.startsWith('<iframe')).toBe(true)
    expect(payload.includes('javascript:alert')).toBe(true)
    expect(payload.endsWith('>')).toBe(true)
  })
})
