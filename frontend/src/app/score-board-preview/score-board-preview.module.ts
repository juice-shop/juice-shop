import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreBoardPreviewComponent } from './score-board-preview.component';
import { ChallengeCardComponent } from './components/challenge-card/challenge-card.component';
import { ScoreCardComponent } from './components/score-card/score-card.component';
import { HackingChallengeProgressScoreCardComponent } from './components/hacking-challenge-progress-score-card/hacking-challenge-progress-score-card.component';



@NgModule({
  declarations: [
    ScoreBoardPreviewComponent,
    ChallengeCardComponent,
    ScoreCardComponent,
    HackingChallengeProgressScoreCardComponent,
  ],
  imports: [
    CommonModule
  ]
})
class ScoreBoardPreviewModule { }

export { ScoreBoardPreviewModule };