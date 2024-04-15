/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, OnInit, Inject, SecurityContext } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-feedback-details',
  templateUrl: './feedback-details.component.html',
  styleUrls: ['./feedback-details.component.scss']
})
export class FeedbackDetailsComponent implements OnInit {
  public feedback: SafeHtml; 
  public id: any;

  constructor (
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
   
    this.feedback = this.sanitizer.sanitize(SecurityContext.HTML, this.dialogData.feedback);
    this.id = this.dialogData.id;
  }
}
