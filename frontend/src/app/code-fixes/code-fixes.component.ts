import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { FormControl } from '@angular/forms'

@Component({
  selector: 'app-code-fixes',
  templateUrl: './code-fixes.component.html',
  styleUrls: ['./code-fixes.component.scss']
})
export class CodeFixesComponent implements OnInit {
  @Input('snippet')
  public snippet: string = ''

  @Input('fixes')
  public fixes: string[]

  @Output('changeFix')
  public emitFix = new EventEmitter<number>()
  
  public selectedFix: number = 0

  ngOnInit (): void {

  }

  changeFix (event: Event) {
    this.selectedFix = parseInt((event.target as HTMLSelectElement).value, 10)
    this.emitFix.emit(this.selectedFix + 1)
  }
}
