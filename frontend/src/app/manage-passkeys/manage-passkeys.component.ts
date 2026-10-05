/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatTooltip } from '@angular/material/tooltip'

import { type PasskeyCredential, PasskeyService } from '../Services/passkey.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-manage-passkeys',
  templateUrl: './manage-passkeys.component.html',
  styleUrls: ['./manage-passkeys.component.scss'],
  imports: [MatCardModule, TranslateModule, MatButtonModule, MatIconModule, MatListModule, MatTooltip]
})
export class ManagePasskeysComponent implements OnInit {
  private readonly passkeyService = inject(PasskeyService)
  private readonly snackBarHelperService = inject(SnackBarHelperService)

  public readonly credentials = signal<PasskeyCredential[]>([])
  public readonly error = signal<string | undefined>(undefined)
  public readonly busy = signal(false)

  ngOnInit (): void {
    void this.loadCredentials()
  }

  async loadCredentials () {
    try {
      this.credentials.set(await firstValueFrom(this.passkeyService.listCredentials()))
    } catch {
      console.log('Failed to fetch passkeys')
    }
  }

  async addPasskey () {
    this.error.set(undefined)
    this.busy.set(true)
    try {
      const { options, regToken } = await firstValueFrom(this.passkeyService.registerOptions())
      const attestation = await this.passkeyService.createAttestation(options)
      await firstValueFrom(this.passkeyService.registerVerify(attestation, regToken))
      await this.loadCredentials()
      this.snackBarHelperService.open('CONFIRM_PASSKEY_ADDED', 'confirmBar')
    } catch (err: any) {
      this.error.set(err?.error?.error || err?.message)
    } finally {
      this.busy.set(false)
    }
  }

  async removePasskey (id: number) {
    this.error.set(undefined)
    try {
      await firstValueFrom(this.passkeyService.deleteCredential(id))
      await this.loadCredentials()
      this.snackBarHelperService.open('CONFIRM_PASSKEY_REMOVED', 'confirmBar')
    } catch (err: any) {
      this.error.set(err?.error?.error || err?.message)
    }
  }
}
