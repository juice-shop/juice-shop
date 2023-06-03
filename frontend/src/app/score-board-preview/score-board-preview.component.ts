import { combineLatest } from 'rxjs'
import { Component, OnChanges, OnInit } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'

import { ChallengeService } from '../Services/challenge.service'
import { CodeSnippetService } from '../Services/code-snippet.service'

import { EnrichedChallenge } from './types/EnrichedChallenge'
import { FilterSetting } from './types/FilterSetting'

@Component({
  selector: 'score-board-preview',
  templateUrl: './score-board-preview.component.html',
  styleUrls: ['./score-board-preview.component.scss']
})
export class ScoreBoardPreviewComponent implements OnInit {
  public allChallenges: EnrichedChallenge[] = []
  public filteredChallenges: EnrichedChallenge[] = []
  public filterSetting: FilterSetting = { categories: new Set() }

  constructor (
    private readonly challengeService: ChallengeService,
    private readonly codeSnippetService: CodeSnippetService,
    private readonly sanitizer: DomSanitizer,
    private readonly route: ActivatedRoute
  ) { }

  onFilterSettingUpdate (filterSetting: FilterSetting) {
    this.filteredChallenges = ScoreBoardPreviewComponent.filterChallenges(this.allChallenges, filterSetting)
  }

  public static filterChallenges (challenges: EnrichedChallenge[], filterSetting: FilterSetting): EnrichedChallenge[] {
    return challenges.filter((challenge) => {
      if (filterSetting.categories.size === 0) {
        return true
      }
      return filterSetting.categories.has(challenge.category)
    })
  }

  ngOnInit () {
    console.time('ScoreBoardPreview - load challenges')
    combineLatest([
      this.challengeService.find({ sort: 'name' }),
      this.codeSnippetService.challenges(),
      this.route.queryParams
    ]).subscribe(([challenges, challengeKeysWithCodeChallenges, queryParams]) => {
      console.timeEnd('ScoreBoardPreview - load challenges')

      console.time('ScoreBoardPreview - transform challenges')
      const transformedChallenges = challenges.map((challenge) => {
        return {
          ...challenge,
          tagList: challenge.tags ? challenge.tags.split(',').map((tag) => tag.trim()) : [],
          description: this.sanitizer.bypassSecurityTrustHtml(challenge.description as string),
          difficultyAsList: [...Array(challenge.difficulty).keys()],
          hasCodingChallenge: challengeKeysWithCodeChallenges.includes(challenge.key)
        }
      })
      this.allChallenges = transformedChallenges
      this.filteredChallenges = ScoreBoardPreviewComponent.filterChallenges(this.allChallenges, this.filterSetting)
      console.timeEnd('ScoreBoardPreview - transform challenges')
    })
  }

  getChallengeKey (index: number, challenge: EnrichedChallenge): string {
    return challenge.key
  }
}
