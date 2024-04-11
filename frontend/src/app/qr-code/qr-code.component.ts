/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Component, Inject, type OnInit } from '@angular/core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons'

library.add(faArrowCircleLeft)

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit {
  public title!: string
  public url!: string
  public address!: string
  public data!: string
  constructor (@Inject(MAT_DIALOG_DATA) public dialogData: any) { }

  ngOnInit () {
    this.title = this.dialogData.title
    this.url = this.dialogData.url
    this.address = this.dialogData.address
    this.data = this.dialogData.data
  }
}
