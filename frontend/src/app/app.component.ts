/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, Inject } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { DOCUMENT } from '@angular/common'
import { dom } from '@fortawesome/fontawesome-svg-core'
import { RouterOutlet } from '@angular/router'
import { WelcomeComponent } from './welcome/welcome.component'
import { ChallengeSolvedNotificationComponent } from './challenge-solved-notification/challenge-solved-notification.component'
import { ServerStartedNotificationComponent } from './server-started-notification/server-started-notification.component'
import { NavbarComponent } from './navbar/navbar.component'
import { SidenavComponent } from './sidenav/sidenav.component'
import { MatSidenavContainer, MatSidenav } from '@angular/material/sidenav'

dom.watch()

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [MatSidenavContainer, MatSidenav, SidenavComponent, NavbarComponent, ServerStartedNotificationComponent, ChallengeSolvedNotificationComponent, WelcomeComponent, RouterOutlet]
})
export class AppComponent {
  constructor (@Inject(DOCUMENT) private readonly _document: HTMLDocument, private readonly translate: TranslateService) {
    this.translate.setDefaultLang('en')
  }
}
