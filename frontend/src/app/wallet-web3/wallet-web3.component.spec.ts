/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { WalletWeb3Component } from './wallet-web3.component'
import { KeysService } from '../Services/keys.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { TranslateModule } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { provideHttpClient } from '@angular/common/http'

describe('WalletWeb3Component', () => {
  let keysService: any
  let snackBarHelperService: any

  beforeEach(async () => {
    keysService = {}
    snackBarHelperService = { open: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), WalletWeb3Component],
      providers: [
        { provide: KeysService, useValue: keysService },
        { provide: SnackBarHelperService, useValue: snackBarHelperService },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents()
  })

  afterEach(() => {
    delete (window as any).ethereum
  })

  it('should create cleanly and gracefully handle missing window.ethereum during ngOnInit', () => {
    delete (window as any).ethereum
    const fixture = TestBed.createComponent(WalletWeb3Component)
    const component = fixture.componentInstance

    expect(() => {
      component.ngOnInit()
    }).not.toThrow()
  })

  it('should attach chainChanged listener when window.ethereum is present and detach it on ngOnDestroy', () => {
    const ethereumMock = {
      on: vi.fn(),
      removeListener: vi.fn(),
      request: vi.fn().mockResolvedValue([])
    };
    (window as any).ethereum = ethereumMock

    const fixture = TestBed.createComponent(WalletWeb3Component)
    const component = fixture.componentInstance
    component.ngOnInit()

    expect(ethereumMock.on).toHaveBeenCalledWith('chainChanged', expect.any(Function))

    fixture.destroy()
    expect(ethereumMock.removeListener).toHaveBeenCalledWith('chainChanged', expect.any(Function))
    expect(ethereumMock.removeListener.mock.calls[0][1]).toBe(ethereumMock.on.mock.calls[0][1])
  })
})
