import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ScoreBoardPreviewComponent } from './score-board-preview.component'
import { ChallengeCardComponent } from './components/challenge-card/challenge-card.component'
import { ScoreCardComponent } from './components/score-card/score-card.component'
import { HackingChallengeProgressScoreCardComponent } from './components/hacking-challenge-progress-score-card/hacking-challenge-progress-score-card.component'
import { CodingChallengeProgressScoreCardComponent } from './components/coding-challenge-progress-score-card/coding-challenge-progress-score-card.component'
import { DifficultyOverviewScoreCardComponent } from './components/difficulty-overview-score-card/difficulty-overview-score-card.component'

@NgModule({
  declarations: [
    ScoreBoardPreviewComponent,
    ChallengeCardComponent,
    ScoreCardComponent,
    HackingChallengeProgressScoreCardComponent,
    CodingChallengeProgressScoreCardComponent,
    DifficultyOverviewScoreCardComponent,
  ],
  imports: [
    CommonModule
  ]
})
class ScoreBoardPreviewModule { }

export { ScoreBoardPreviewModule }
