/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class WindowRefService {

  get nativeWindow (): any {
    return getWindow()
  }

}

function getWindow (): any {
  return window
}
