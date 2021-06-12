import { Component, ElementRef, OnInit, Input, OnChanges, ViewChild } from '@angular/core'

@Component({
  selector: 'app-code-area',
  templateUrl: './code-area.component.html',
  styleUrls: ['./code-area.component.scss']
})
export class CodeAreaComponent implements OnInit, OnChanges {
  @Input('code') public code: string = ''
  @Input('vulnLines') public vulnLines: any
  @ViewChild('emphasize') emphasize: ElementRef
  public langs = ['javascript', 'typescript', 'json', 'yaml']
  public lines: string
  public selectedLines: any = []

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
        lines += `<span id='line${c++}'>◻️</span><br>`
      }
    }

    lines += `<span id=${c++}>◻️</span><br>`

    return lines
  }

  addEventListeners = (code) => {
    let c = 1
    for (let i = 0; i < code.length; i++) {
      if (code[i] === '\n') {
        this.element.nativeElement.querySelector(`#line${c++}`).addEventListener('click', this.selectLines)
      }
    }
  }

  selectLines = (event) => {
    const line = parseInt(event.target.id.split('line')[1], 10)
    if (this.selectedLines.includes(line)) {
      event.target.innerText = '◻️'
      this.selectedLines.filter((value) => {
        return value !== line
      })
    } else {
      event.target.innerText = '✅'
      this.selectedLines.push(line)
    }
  }
}
