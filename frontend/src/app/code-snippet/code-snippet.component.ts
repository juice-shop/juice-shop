/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { CodeSnippetService, CodeSnippet } from '../Services/code-snippet.service'
import { VulnLinesService } from '../Services/vuln-lines.service'
import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'

enum ResultState {
  Undecided,
  Right,
  Wrong,
}

@Component({
  selector: 'app-user-details',
  templateUrl: './code-snippet.component.html',
  styleUrls: ['./code-snippet.component.scss']
})
export class CodeSnippetComponent implements OnInit {
  public snippet: CodeSnippet
  public selectedLines: number[]
  public submissionCnt: number = 0
  public result: ResultState = ResultState.Undecided

  constructor (@Inject(MAT_DIALOG_DATA) public dialogData: any, private readonly codeSnippetService: CodeSnippetService, private readonly vulnLinesService: VulnLinesService) { }

  ngOnInit () {
    this.codeSnippetService.get(this.dialogData.key).subscribe((snippet) => {
      this.snippet = snippet
    }, (err) => {
      this.snippet = { snippet: JSON.stringify(err.error?.error), vulnLines: [] }
    })
  }

  addLine = (lines) => {
    this.selectedLines = lines
  }

  checkLines = () => {
    this.submissionCnt++
    this.vulnLinesService.check(this.dialogData.key, this.selectedLines).subscribe((verdict) => {
      console.log(verdict)
      if (verdict.verdict) {
        this.result = ResultState.Right
      } else {
        this.result = ResultState.Wrong
      }
    })
  }

  resultIcon (): string {
    switch (this.result) {
      case ResultState.Right:
        return 'check'
      case ResultState.Wrong:
        return 'clear'
      default:
        return 'send'
    }
  }
}
