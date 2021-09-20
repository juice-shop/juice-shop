/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component } from '@angular/core'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-privacy-security',
  templateUrl: './privacy-security.component.html',
  styleUrls: ['./privacy-security.component.scss']
})
export class PrivacySecurityComponent {
  Ip!: string
  windowWidth: number = window.innerWidth
  ngAfterViewInit () {
    this.windowWidth = window.innerWidth
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    )

  constructor (private readonly breakpointObserver: BreakpointObserver) {}
}
