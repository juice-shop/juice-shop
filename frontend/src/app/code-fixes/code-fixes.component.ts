import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'

interface RandomFixes {
  fix: string
  index: number
}
@Component({
  selector: 'app-code-fixes',
  templateUrl: './code-fixes.component.html',
  styleUrls: ['./code-fixes.component.scss']
})
export class CodeFixesComponent implements OnInit {
  @Input('snippet')
  public snippet: string = ''

  @Input('fixes')
  public fixes: string[] = []

  @Output('changeFix')
  public emitFix = new EventEmitter<number>()

  public selectedFix: number = 0
  public randomFixes: RandomFixes[] = []

  shuffle () {
    let index = 0
    for (const fix of this.fixes) {
      this.randomFixes.push({
        fix: fix,
        index: index
      })
      index++
    }
    let randomRotation = Math.random() * 100
    while (randomRotation > 0) {
      const end = this.randomFixes[this.randomFixes.length - 1]
      for (let i = this.randomFixes.length - 1; i > 0; i--) {
        this.randomFixes[i] = this.randomFixes[i - 1]
      }
      this.randomFixes[0] = end
      randomRotation--
    }
  }

  ngOnInit (): void {
    this.shuffle()
    this.initialEmit()
  }

  initialEmit () {
    if (this.randomFixes[0] !== undefined) { this.emitFix.emit(this.randomFixes[0].index) }
  }

  changeFix (event: Event) {
    this.selectedFix = parseInt((event.target as HTMLSelectElement).value, 10)
    this.emitFix.emit(this.randomFixes[this.selectedFix].index)
  }
}
