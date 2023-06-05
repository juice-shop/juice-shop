import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core'
import { EnrichedChallenge } from '../../../../types/EnrichedChallenge'

@Component({
  selector: 'category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss']
})
export class CategoryFilterComponent implements OnInit, OnChanges {
  public availableCategories = new Set<string>()

  @Input()
  allChallenges: EnrichedChallenge[]

  @Input()
  categories: Set<string>

  @Output()
  categoriesChange = new EventEmitter<Set<string>>()

  ngOnInit () {
    this.availableCategories = CategoryFilterComponent.getAvailableCategories(this.allChallenges)
  }

  ngOnChanges () {
    this.availableCategories = CategoryFilterComponent.getAvailableCategories(this.allChallenges)
  }

  public static getAvailableCategories (allChallenges: EnrichedChallenge[]) {
    return new Set(allChallenges.map((challenge) => challenge.category))
  }

  public resetCategoryFilter () {
    this.categories = new Set()
    this.categoriesChange.emit(this.categories)
  }

  public toggleCategorySelected (category: string) {
    if (this.categories.has(category)) {
      this.categories.delete(category)
    } else {
      this.categories.add(category)
    }
    this.categoriesChange.emit(this.categories)
  }

  public isAllCategoriesSelected () {
    return (this.categories.size === 0)
  }

  public isCategorySelected (category: string) {
    return this.categories.has(category)
  }
}
