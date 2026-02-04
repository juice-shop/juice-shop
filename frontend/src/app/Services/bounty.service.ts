/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
    providedIn: 'root'
})
export class BountyService {
    private readonly hostServer = 'http://localhost:3000'

    constructor(private readonly http: HttpClient) { }

    getBountyStatus() {
        return this.http.get(this.hostServer + '/rest/bounty/status').pipe(map((response: any) => response.data), catchError((err) => { throw err }))
    }

    claimBounty() {
        return this.http.put(this.hostServer + '/rest/bounty/claim', {}).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
    }
}
