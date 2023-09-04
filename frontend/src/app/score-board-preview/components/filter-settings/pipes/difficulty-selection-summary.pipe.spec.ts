import { DifficultySelectionSummaryPipe } from './difficulty-selection-summary.pipe'

describe('DifficultySelectionSummaryPipe', () => {
  let pipe: DifficultySelectionSummaryPipe

  beforeEach(async () => {
    pipe = new DifficultySelectionSummaryPipe()
  })

  it('should properly summarize selected difficulties', () => {
    expect(pipe.transform([])).toBe('')
    expect(pipe.transform([1])).toBe('1')
    expect(pipe.transform([1, 3, 5])).toBe('1, 3, 5')
    expect(pipe.transform([1, 2, 3, 5])).toBe('1 - 3, 5')
    expect(pipe.transform([1, 3, 4, 5])).toBe('1, 3 - 5')
    expect(pipe.transform([1, 2, 4, 5, 6])).toBe('1 - 2, 4 - 6')
    expect(pipe.transform([1, 2, 3, 4, 5, 6])).toBe('1 - 6')
  })
})
