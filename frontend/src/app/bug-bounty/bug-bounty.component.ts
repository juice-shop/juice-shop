/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, OnInit } from '@angular/core'
import { BountyService } from '../Services/bounty.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationService } from '../Services/configuration.service'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatTableModule } from '@angular/material/table'
import { CommonModule } from '@angular/common'

@Component({
    selector: 'app-bug-bounty',
    templateUrl: './bug-bounty.component.html',
    styleUrls: ['./bug-bounty.component.scss'],
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule]
})
export class BugBountyComponent implements OnInit {
    public bounties: any[] = []
    public potentialPayout: number = 0
    public loading: boolean = false
    public walletBalance: number = 0

    constructor(private readonly bountyService: BountyService, private readonly snackBar: MatSnackBar, private readonly ngZone: NgZone, private readonly configurationService: ConfigurationService) { }

    ngOnInit() {
        this.refresh()
    }

    refresh() {
        this.loading = true
        this.bountyService.getBountyStatus().subscribe((data: any) => {
            this.bounties = data
            this.potentialPayout = this.bounties.filter((b: any) => !b.claimed).reduce((sum: number, b: any) => sum + b.reward, 0)
            this.loading = false
        }, (err) => {
            this.loading = false
            console.log(err)
        })
    }

    claim() {
        this.loading = true
        this.bountyService.claimBounty().subscribe((data: any) => {
            if (data.totalReward > 0) {
                this.snackBar.open(`Claimed ${data.totalReward} Juice Shop Coins!`, 'OK', { duration: 5000 })
                this.walletBalance = data.walletBalance
            } else {
                this.snackBar.open('No new bounties to claim.', 'OK', { duration: 3000 })
            }
            this.refresh()
        }, (err) => {
            this.loading = false
            this.snackBar.open('Failed to claim bounties.', 'Close')
            console.log(err)
        })
    }
}
