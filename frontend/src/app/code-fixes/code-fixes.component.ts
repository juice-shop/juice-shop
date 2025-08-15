import { Component, Input, type OnInit, ViewChild, type DoCheck, KeyValueDiffers, type KeyValueDiffer } from '@angular/core'
import { NgxTextDiffComponent, NgxTextDiffModule } from '@winarg/ngx-text-diff'

import { CookieService } from 'ngy-cookie'
import { type RandomFixes } from '../code-snippet/code-snippet.component'
import { type DiffTableFormat } from '@winarg/ngx-text-diff/lib/ngx-text-diff.model'

@Component({
  selector: 'app-code-fixes',
  templateUrl: './code-fixes.component.html',
  styleUrls: ['./code-fixes.component.scss'],
  imports: [NgxTextDiffModule]
})
export class CodeFixesComponent implements OnInit, DoCheck {
  differ: KeyValueDiffer<string, DiffTableFormat>

  constructor (private readonly cookieService: CookieService, private readonly differs: KeyValueDiffers) {
    this.cookieService = cookieService
    this.differ = this.differs.find({}).create()
  }

  @Input('snippet')
  public snippet: string = ''

  @Input('fixes')
  public fixes: string[] = []

  @Input('selectedFix')
  public selectedFix: number = 0

  @Input('randomFixes')
  public randomFixes: RandomFixes[] = []

  @Input('format')
  public format: string = 'SideBySide'

  @ViewChild('codeComponent', { static: false }) codeComponent: NgxTextDiffComponent

  ngOnInit (): void {
    if (this.cookieService.hasKey('code-fixes-component-format')) {
      this.format = this.cookieService.get('code-fixes-component-format')
    } else {
      this.format = 'LineByLine'
      this.cookieService.put('code-fixes-component-format', 'LineByLine')
    }
  }

  ngDoCheck () {
    try {
      const change = this.differ.diff({ 'diff-format': this.codeComponent.format })
      if (change) {
        change.forEachChangedItem(item => {
          this.format = item.currentValue
          this.cookieService.put('code-fixes-component-format', this.format)
        }
        )
      }
    } catch {
    }
  }
}
