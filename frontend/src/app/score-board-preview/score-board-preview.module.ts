import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreBoardPreviewComponent } from './score-board-preview.component';
import { ChallengeCardComponent } from './components/challenge-card/challenge-card.component';



@NgModule({
  declarations: [
    ScoreBoardPreviewComponent,
    ChallengeCardComponent,
  ],
  imports: [
    CommonModule
  ]
})
class ScoreBoardPreviewModule { }

export { ScoreBoardPreviewModule };