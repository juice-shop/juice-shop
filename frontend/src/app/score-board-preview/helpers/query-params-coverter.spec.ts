import { DEFAULT_FILTER_SETTING } from '../types/FilterSetting'
import { fromQueryParams, toQueryParams } from './query-params-converters'

describe('fromQueryParams', () => {
  it('should convert empty settings to default filters', () => {
    expect(fromQueryParams({})).toEqual(DEFAULT_FILTER_SETTING)
  })
  it('should somewhat filled query params properly', () => {
    expect(
      fromQueryParams({
        searchQuery: 'jwt token',
        difficulties: '1',
        status: 'solved',
        categories: 'Improper Input Validation'
      })
    ).toEqual({
      ...DEFAULT_FILTER_SETTING,
      searchQuery: 'jwt token',
      difficulties: [1],
      status: 'solved',
      categories: new Set(['Improper Input Validation'])
    })
  })
  it('should fully filled query params properly', () => {
    expect(
      fromQueryParams({
        searchQuery: 'jwt token',
        difficulties: '1,3,5,6',
        status: 'partially-solved',
        tags: 'Danger Zone,Good for Demos,Prerequisite',
        categories: 'Improper Input Validation,Broken Anti Automation'
      })
    ).toEqual({
      ...DEFAULT_FILTER_SETTING,
      searchQuery: 'jwt token',
      difficulties: [1, 3, 5, 6],
      status: 'partially-solved',
      tags: ['Danger Zone', 'Good for Demos', 'Prerequisite'],
      categories: new Set([
        'Improper Input Validation',
        'Broken Anti Automation'
      ])
    })
  })
})

describe('toQueryParams', () => {
  it('should convert default filterSettings to empty params', () => {
    expect(
      toQueryParams(DEFAULT_FILTER_SETTING)
    ).toEqual({
      searchQuery: undefined,
      difficulties: undefined,
      status: undefined,
      tags: undefined,
      categories: undefined
    })
  })
  it('should convert somewhat filled filterSettings correctly', () => {
    expect(
      toQueryParams({
        ...DEFAULT_FILTER_SETTING,
        searchQuery: 'jwt token',
        difficulties: [1],
        status: 'solved',
        categories: new Set(['Improper Input Validation'])
      })
    ).toEqual({
      searchQuery: 'jwt token',
      difficulties: '1',
      status: 'solved',
      tags: undefined,
      categories: 'Improper Input Validation'
    })
  })
  it('should convert fully filled filterSettings correctly', () => {
    expect(
      toQueryParams({
        ...DEFAULT_FILTER_SETTING,
        searchQuery: 'jwt token',
        difficulties: [1, 3, 5, 6],
        status: 'partially-solved',
        tags: ['Danger Zone', 'Good for Demos', 'Prerequisite'],
        categories: new Set(['Improper Input Validation', 'Broken Anti Automation'])
      })
    ).toEqual({
      searchQuery: 'jwt token',
      difficulties: '1,3,5,6',
      status: 'partially-solved',
      tags: 'Danger Zone,Good for Demos,Prerequisite',
      categories: 'Improper Input Validation,Broken Anti Automation'
    })
  })
})
