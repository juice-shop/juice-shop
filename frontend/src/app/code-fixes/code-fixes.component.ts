import { Component, Input, OnInit } from '@angular/core'

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

  ngOnInit (): void {
    this.snippet = this.snippet.replace(/(\r)/gm, '')
    this.snippet += '\n'
  }
}
