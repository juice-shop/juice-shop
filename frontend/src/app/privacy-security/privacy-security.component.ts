/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, inject } from '@angular/core'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { type Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { RouterOutlet } from '@angular/router'
import { MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav'

@Component({
  selector: 'app-privacy-security',
  templateUrl: './privacy-security.component.html',
  styleUrls: ['./privacy-security.component.scss'],
  standalone: true,
  imports: [MatSidenavContainer, MatSidenavContent, RouterOutlet]
})
export class PrivacySecurityComponent {
  Ip!: string
  windowWidth: number = window.innerWidth
  ngAfterViewInit () {
    this.windowWidth = window.innerWidth
  }

  isHandset$: Observable<boolean> = inject(BreakpointObserver).observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    )
}
