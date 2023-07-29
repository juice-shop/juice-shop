import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatFormFieldModule } from '@angular/material/form-field'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { ScoreBoardPreviewComponent } from './score-board-preview.component'
import { ScoreCardComponent } from './components/score-card/score-card.component'
import { WarningCardComponent } from './components/warning-card/warning-card.component'
import { ChallengeCardComponent } from './components/challenge-card/challenge-card.component'
import { FilterSettingsComponent } from './components/filter-settings/filter-settings.component'
import { PreviewFeatureNotice } from './components/preview-feature-notice/preview-feature-notice.component'
import { TutorialModeWarningComponent } from './components/tutorial-mode-warning/tutorial-mode-warning.component'
import { CategoryFilterComponent } from './components/filter-settings/components/category-filter/category-filter.component'
import { DifficultyOverviewScoreCardComponent } from './components/difficulty-overview-score-card/difficulty-overview-score-card.component'
import { ChallengesUnavailableWarningComponent } from './components/challenges-unavailable-warning/challenges-unavailable-warning.component'
import { CodingChallengeProgressScoreCardComponent } from './components/coding-challenge-progress-score-card/coding-challenge-progress-score-card.component'
import { HackingChallengeProgressScoreCardComponent } from './components/hacking-challenge-progress-score-card/hacking-challenge-progress-score-card.component'

import { ChallengeHintPipe } from './pipes/challenge-hint.pipe'
import { RouterModule } from '@angular/router'

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
    ChallengesUnavailableWarningComponent,
    TutorialModeWarningComponent,
    PreviewFeatureNotice,
    WarningCardComponent,
    ChallengeHintPipe,
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatDialogModule,
    TranslateModule,
    RouterModule,
  ],
})
class ScoreBoardPreviewModule {}

export { ScoreBoardPreviewModule }
