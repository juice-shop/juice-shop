import { Component, Input, OnInit, OnChanges } from '@angular/core'
import { DiffResults } from 'ngx-text-diff/lib/ngx-text-diff.model'
import { Observable, Subject } from 'rxjs'

export interface DiffContent {
  leftContent: string
  rightContent: string
}

@Component({
  selector: 'app-code-fixes',
  templateUrl: './code-fixes.component.html',
  styleUrls: ['./code-fixes.component.scss']
})
export class CodeFixesComponent implements OnInit, OnChanges {
  @Input('snippet')
  public snippet: string = ''

  content: DiffContent = {
    leftContent: '',
    rightContent: ''
  }

  options: any = {
    lineNumbers: true,
    mode: 'typescript'
  }

  contentObservable: Subject<DiffContent> = new Subject<DiffContent>()
  contentObservable$: Observable<DiffContent> = this.contentObservable.asObservable()

  ngOnInit (): void {
    this.content.leftContent = `${this.snippet}`
    this.content.rightContent = `${this.snippet}`
    this.contentObservable.next(this.content)
  }

  ngOnChanges () {

  }

  onCompareResults (diffResults: DiffResults) {
    console.log('diffResults', diffResults)
  }
}
