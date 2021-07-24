import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatTabChangeEvent } from '@angular/material/tabs'

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

  public tab: FormControl = new FormControl(0)

  ngOnInit (): void {

  }

  toggleTab = (event: MatTabChangeEvent) => {
    this.tab.setValue(event)
    this.emitFix.emit(event.index + 1)
  }
}
