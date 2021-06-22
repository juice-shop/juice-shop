import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
@Component({
  selector: 'app-score-board2',
  templateUrl: './score-board2.component.html',
  styleUrls: ['./score-board2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScoreBoard2Component implements OnInit {
  ngOnInit (): void {}
}
export class CdkVirtualScrollTemplateCacheExample {
  items = Array.from({ length: 100000 }).map((_, i) => `Item #${i}`)
}
