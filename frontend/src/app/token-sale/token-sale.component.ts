/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ConfigurationService } from '../Services/configuration.service'
import { Component, type OnInit } from '@angular/core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBitcoin } from '@fortawesome/free-brands-svg-icons'
import { faCommentAlt, faComments, faGraduationCap, faUniversity } from '@fortawesome/free-solid-svg-icons'
import { faCommentAlt as farCommentAlt, faComments as farComments } from '@fortawesome/free-regular-svg-icons'
import { MatButtonModule } from '@angular/material/button'
import { TranslateModule } from '@ngx-translate/core'
import { FlexModule } from '@angular/flex-layout/flex'
import { MatCardModule, MatCardHeader, MatCardTitle, MatCardSubtitle } from '@angular/material/card'

library.add(faBitcoin, faUniversity, faGraduationCap, faCommentAlt, faComments, farCommentAlt, farComments)

@Component({
  selector: 'app-token-sale',
  templateUrl: './token-sale.component.html',
  styleUrls: ['./token-sale.component.scss'],
  standalone: true,
  imports: [MatCardModule, FlexModule, MatCardHeader, MatCardTitle, MatCardSubtitle, TranslateModule, MatButtonModule]
})
export class TokenSaleComponent implements OnInit {
  public altcoinName = 'Juicycoin'
  constructor (private readonly configurationService: ConfigurationService) { }

  ngOnInit (): void {
    this.configurationService.getApplicationConfiguration().subscribe((config: any) => {
      if (config?.application?.altcoinName) {
        this.altcoinName = config.application.altcoinName
      }
    }, (err) => { console.log(err) })
  }
}
