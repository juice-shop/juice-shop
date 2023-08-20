import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'
import { Subscription } from 'rxjs'

import { FeatureFlagService } from 'src/app/Services/feature-flag.service'

@Component({
  selector: "score-board-additional-settings-dialog",
  templateUrl: "./score-board-additional-settings-dialog.component.html",
  styleUrls: ["./score-board-additional-settings-dialog.component.scss"],
})
export class ScoreBoardAdditionalSettingsDialogComponent
  implements OnInit, OnDestroy {
  public scoreBoardVersion: null | 'v1' | 'v2' = null

  private readonly subscriptions: Subscription[] = []

  constructor (
    public dialogRef: MatDialogRef<ScoreBoardAdditionalSettingsDialogComponent>,
    public featureFlagService: FeatureFlagService
  ) {}

  async ngOnInit () {
    const subscription = this.featureFlagService.defaultScoreBoard$.subscribe(
      (version) => {
        this.scoreBoardVersion = version
      }
    )
    this.subscriptions.push(subscription)
  }

  ngOnDestroy () {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe()
    }
  }

  updateDefaultScoreBoard (value: 'v1' | 'v2') {
    this.featureFlagService.setDefaultScoreBoard(value)
  }
}
