import { Component, ElementRef, OnInit, Input, OnChanges, ViewChild, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'app-code-area',
  templateUrl: './code-area.component.html',
  styleUrls: ['./code-area.component.scss']
})
export class CodeAreaComponent implements OnInit, OnChanges {
  @Input('code') public code: string = ''
  @Input('vulnLines') public vulnLines: number[]
  @ViewChild('emphasize') emphasize: ElementRef
  public langs = ['javascript', 'typescript', 'json', 'yaml']
  public lines: string
  public selectedLines: number[] = []
  public lineNums: number[] = []
  public select = '✅'
  public unselect = '🔲'
  @Output() addLine = new EventEmitter<number[]>()

  constructor (private readonly element: ElementRef) { }

  ngOnInit (): void {

  }

  ngOnChanges (): void {
    this.lineNums = this.markLines(this.code)
  }

  markLines = (code: string) => {
    const lines = []
    let c = 1
    for (let i = 0; i < code.length; i++) {
      if (code[i] === '\n') {
        lines.push(c++)
      }
    }

    lines.push(c++)

    return lines
  }

  selectLines = (event) => {
    const line = parseInt(event.target.id.split('line')[1], 10)
    if (this.selectedLines.includes(line)) {
      event.target.innerText = this.unselect
      this.selectedLines = this.selectedLines.filter((value) => {
        return value !== line
      })
    } else {
      event.target.innerText = this.select
      this.selectedLines.push(line)
    }

    this.addLine.emit(this.selectedLines)
  }
}
