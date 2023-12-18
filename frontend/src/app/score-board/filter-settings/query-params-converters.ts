import type { Params } from '@angular/router'

import { DEFAULT_FILTER_SETTING, type FilterSetting } from './FilterSetting'

export function fromQueryParams (queryParams: Readonly<Params>): FilterSetting {
  const filterSetting: FilterSetting = { ...structuredClone(DEFAULT_FILTER_SETTING) }
  if (queryParams.searchQuery) {
    filterSetting.searchQuery = queryParams.searchQuery
  }
  if (queryParams.difficulties) {
    filterSetting.difficulties = queryParams.difficulties
      .split(',')
      .map((difficulty) => parseInt(difficulty, 10))
      .filter((difficulty) => !isNaN(difficulty))
  }
  if (queryParams.tags) {
    filterSetting.tags = queryParams.tags.split(',')
  }
  if (queryParams.status) {
    filterSetting.status = queryParams.status
  }
  if (queryParams.categories) {
    filterSetting.categories = queryParams.categories.split(',')
  }
  if (queryParams.showDisabledChallenges !== undefined) {
    filterSetting.showDisabledChallenges = queryParams.showDisabledChallenges === 'true'
  }

  return filterSetting
}

export function toQueryParams (filterSetting: Readonly<FilterSetting>): Params {
  return {
    searchQuery: filterSetting.searchQuery || undefined,
    difficulties: filterSetting.difficulties.join(',') || undefined,
    status: filterSetting.status || undefined,
    tags: filterSetting.tags.join(',') || undefined,
    categories: filterSetting.categories.join(',') || undefined,
    showDisabledChallenges: !filterSetting.showDisabledChallenges ? 'false' : undefined
  }
}
