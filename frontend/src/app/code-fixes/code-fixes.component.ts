import { Component, Input, type OnInit, ViewChild, type DoCheck, KeyValueDiffers, type KeyValueDiffer, inject } from '@angular/core'
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
  private readonly cookieService = inject(CookieService);
  private readonly differs = inject(KeyValueDiffers);

  differ: KeyValueDiffer<string, DiffTableFormat>

  constructor () {
    const cookieService = this.cookieService;

    this.cookieService = cookieService
    this.differ = this.differs.find({}).create()
  }

  @Input()
  public snippet = ''

  @Input()
  public fixes: string[] = []

  @Input()
  public selectedFix = 0

  @Input()
  public randomFixes: RandomFixes[] = []

  @Input()
  public format = 'SideBySide'

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
      console.warn('Error during diffing')
    }
  }
}
