/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatDividerModule } from '@angular/material/divider'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { CodeSnippetComponent } from './code-snippet.component'
import { CodeSnippetService } from '../Services/code-snippet.service'
import { CookieModule, CookieService } from 'ngx-cookie'

describe('CodeSnippetComponent', () => {
  let component: CodeSnippetComponent
  let fixture: ComponentFixture<CodeSnippetComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CookieModule.forRoot(),
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        MatDividerModule,
        MatDialogModule
      ],
      declarations: [CodeSnippetComponent],
      providers: [
        CodeSnippetService,
        CookieService,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { dialogData: {} } }
      ]
    })
      .compileComponents()
    TestBed.inject(CookieService)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSnippetComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
