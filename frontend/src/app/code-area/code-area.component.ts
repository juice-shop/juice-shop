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
  public select = '✅'
  public unselect = '🔲'
  @Output() addLine = new EventEmitter<number[]>()

  constructor (private readonly element: ElementRef) { }

  ngOnInit (): void {

  }

  ngOnChanges (): void {
    this.lines = this.markLines(this.code)
    this.emphasize.nativeElement.innerHTML = this.lines
    this.addEventListeners(this.code)
  }

  markLines = (code: string) => {
    let lines = ''
    let c = 1
    for (let i = 0; i < code.length; i++) {
      if (code[i] === '\n') {
        lines += `<span id='line${c++}'>${this.unselect}</span><br>`
      }
    }

    lines += `<span id='line${c++}'>${this.unselect}</span><br>`

    return lines
  }

  addEventListeners = (code) => {
    let c = 1
    for (let i = 0; i < code.length; i++) {
      if (code[i] === '\n') {
        this.element.nativeElement.querySelector(`#line${c++}`).addEventListener('click', this.selectLines)
      }
    }

    this.element.nativeElement.querySelector(`#line${c++}`).addEventListener('click', this.selectLines)
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
