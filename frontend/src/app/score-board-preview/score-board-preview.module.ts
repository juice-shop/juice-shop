import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ScoreBoardPreviewComponent } from './score-board-preview.component'
import { ChallengeCardComponent } from './components/challenge-card/challenge-card.component'
import { ScoreCardComponent } from './components/score-card/score-card.component'
import { HackingChallengeProgressScoreCardComponent } from './components/hacking-challenge-progress-score-card/hacking-challenge-progress-score-card.component'
import { CodingChallengeProgressScoreCardComponent } from './components/coding-challenge-progress-score-card/coding-challenge-progress-score-card.component'
import { DifficultyOverviewScoreCardComponent } from './components/difficulty-overview-score-card/difficulty-overview-score-card.component'
import { FilterSettingsComponent } from './components/filter-settings/filter-settings.component'
import { CategoryFilterComponent } from './components/filter-settings/components/category-filter/category-filter.component'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

@NgModule({
  declarations: [
    ScoreBoardPreviewComponent,
    ChallengeCardComponent,
    ScoreCardComponent,
    HackingChallengeProgressScoreCardComponent,
    CodingChallengeProgressScoreCardComponent,
    DifficultyOverviewScoreCardComponent,
    FilterSettingsComponent,
    CategoryFilterComponent,
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule
  ],
})
class ScoreBoardPreviewModule {}

export { ScoreBoardPreviewModule }
