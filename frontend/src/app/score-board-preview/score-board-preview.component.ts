import { combineLatest } from 'rxjs'
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'

import { ChallengeService } from '../Services/challenge.service'
import { CodeSnippetService } from '../Services/code-snippet.service'

import { EnrichedChallenge } from './types/EnrichedChallenge'
import { DEFAULT_FILTER_SETTING, FilterSetting } from './types/FilterSetting'

import { filterChallenges } from './helpers/challenge-filtering'
import { SocketIoService } from '../Services/socket-io.service'

interface ChallengeSolvedWebsocket {
  key: string
  name: string
  challenge: string
  flag: string
  hidden: boolean
  isRestore: boolean
}

@Component({
  selector: 'score-board-preview',
  templateUrl: './score-board-preview.component.html',
  styleUrls: ['./score-board-preview.component.scss']
})
export class ScoreBoardPreviewComponent implements OnInit, OnDestroy {
  public allChallenges: EnrichedChallenge[] = []
  public filteredChallenges: EnrichedChallenge[] = []
  public filterSetting: FilterSetting = structuredClone(DEFAULT_FILTER_SETTING)

  constructor (
    private readonly challengeService: ChallengeService,
    private readonly codeSnippetService: CodeSnippetService,
    private readonly sanitizer: DomSanitizer,
    private readonly ngZone: NgZone,
    private readonly io: SocketIoService
  ) { }

  ngOnInit () {
    console.time('ScoreBoardPreview - load challenges')
    combineLatest([
      this.challengeService.find({ sort: 'name' }),
      this.codeSnippetService.challenges()
    ]).subscribe(([challenges, challengeKeysWithCodeChallenges]) => {
      console.timeEnd('ScoreBoardPreview - load challenges')

      console.time('ScoreBoardPreview - transform challenges')
      const transformedChallenges = challenges.map((challenge) => {
        return {
          ...challenge,
          tagList: challenge.tags ? challenge.tags.split(',').map((tag) => tag.trim()) : [],
          originalDescription: challenge.description as string,
          description: this.sanitizer.bypassSecurityTrustHtml(challenge.description as string),
          difficultyAsList: [...Array(challenge.difficulty).keys()],
          hasCodingChallenge: challengeKeysWithCodeChallenges.includes(challenge.key)
        }
      })
      this.allChallenges = transformedChallenges
      this.filteredChallenges = filterChallenges(this.allChallenges, this.filterSetting)
      console.timeEnd('ScoreBoardPreview - transform challenges')
    })

    this.io.socket().on('challenge solved', this.onChallengeSolvedWebsocket.bind(this))
  }

  ngOnDestroy (): void {
    this.io.socket().off('challenge solved', this.onChallengeSolvedWebsocket.bind(this))
  }

  onFilterSettingUpdate (filterSetting: FilterSetting) {
    console.log('ScoreBoardPreview - filter setting update', filterSetting)
    this.filterSetting = filterSetting
    this.filteredChallenges = filterChallenges(this.allChallenges, filterSetting)
  }

  onChallengeSolvedWebsocket (data?: ChallengeSolvedWebsocket) {
    console.log('ScoreBoardPreview - challenge solved', data)
    if (!data) {
      return
    }

    const allChallenges = this.allChallenges.map((challenge) => {
      if (challenge.key === data.key) {
        console.log('ScoreBoardPreview - updating challenge', data.key)
        return {
          ...challenge,
          solved: true
        }
      }
      return { ...challenge }
    })
    this.allChallenges = [...allChallenges]
    this.filteredChallenges = filterChallenges(allChallenges, this.filterSetting)
    // manually trigger angular change detection... :(
    // unclear why this is necessary, possibly because the socket.io callback is not running inside angular
    this.ngZone.run(() => {})
  }

  // angular helper to speed up challenge rendering
  getChallengeKey (index: number, challenge: EnrichedChallenge): string {
    return challenge.key
  }

  public reset () {
    this.filterSetting = structuredClone(DEFAULT_FILTER_SETTING)
    this.filteredChallenges = filterChallenges(this.allChallenges, this.filterSetting)
  }
}
