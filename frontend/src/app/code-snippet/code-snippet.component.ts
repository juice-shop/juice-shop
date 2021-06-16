/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { CodeSnippetService, CodeSnippet } from '../Services/code-snippet.service'
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
  public result: ResultState = ResultState.Undecided

  constructor (@Inject(MAT_DIALOG_DATA) public dialogData: any, private readonly codeSnippetService: CodeSnippetService) { }

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
    if(this.checkArrayIdentical(this.selectedLines, this.snippet.vulnLines)) {
      this.result = ResultState.Right
    } else {
      this.result = ResultState.Wrong
    }
  }

  checkArrayIdentical(numbers1: number[], numbers2: number[]): boolean {
    const sortedNumbers1 = numbers1.sort()
    const sortedNumbers2 = numbers2.sort()

    if (numbers1.length !== numbers2.length) return false

    for (const index in sortedNumbers1) {
      if (sortedNumbers1[index] !== sortedNumbers2[index]) {
        return false
      }
    }

    return true;
  }

  resultIcon() : string{
    switch( this.result) {
      case ResultState.Right:
        return 'check'
      case ResultState.Wrong:
        return 'clear'
      default:
        return 'send'
    }
  }
}
