import type { Mock } from "vitest"
/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ResultState } from '../coding-challenge.types'
import { handleVerdict } from './handle-verdict'
import { of, throwError } from 'rxjs'

describe('handleVerdict', () => {
    let challengeService: any
    let cookieService: any
    let solved: any
    let destroyRef: any
    let setResult: Mock
    let setShaking: Mock

    beforeEach(() => {
        challengeService = {
            continueCodeFindIt: vi.fn().mockReturnValue(of('findItCode')),
            continueCodeFixIt: vi.fn().mockReturnValue(of('fixItCode'))
        }
        cookieService = {
            put: vi.fn().mockName("CookieService.put")
        }
        solved = {
            emit: vi.fn().mockName("OutputEmitterRef.emit")
        }
        destroyRef = {
            onDestroy: vi.fn().mockName("DestroyRef.onDestroy")
        }
        setResult = vi.fn()
        setShaking = vi.fn()
    })

    it('should set result to Wrong and shaking to true on false verdict', () => {
        handleVerdict({
            verdict: false,
            variant: 'FindIt',
            challengeService,
            cookieService,
            solved,
            destroyRef,
            setResult,
            setShaking
        })
        expect(setResult).toHaveBeenCalledWith(ResultState.Wrong)
        expect(setShaking).toHaveBeenCalledWith(true)
        expect(challengeService.continueCodeFindIt).not.toHaveBeenCalled()
        expect(solved.emit).not.toHaveBeenCalled()
    })

    it('should set result to Right on true verdict', () => {
        handleVerdict({
            verdict: true,
            variant: 'FindIt',
            challengeService,
            cookieService,
            solved,
            destroyRef,
            setResult,
            setShaking
        })
        expect(setResult).toHaveBeenCalledWith(ResultState.Right)
        expect(setShaking).not.toHaveBeenCalled()
    })

    it('should call continueCodeFindIt for FindIt variant', () => {
        handleVerdict({
            verdict: true,
            variant: 'FindIt',
            challengeService,
            cookieService,
            solved,
            destroyRef,
            setResult,
            setShaking
        })
        expect(challengeService.continueCodeFindIt).toHaveBeenCalled()
        expect(challengeService.continueCodeFixIt).not.toHaveBeenCalled()
    })

    it('should call continueCodeFixIt for FixIt variant', () => {
        handleVerdict({
            verdict: true,
            variant: 'FixIt',
            challengeService,
            cookieService,
            solved,
            destroyRef,
            setResult,
            setShaking
        })
        expect(challengeService.continueCodeFixIt).toHaveBeenCalled()
        expect(challengeService.continueCodeFindIt).not.toHaveBeenCalled()
    })

    it('should store continue code as cookie on true verdict', () => {
        handleVerdict({
            verdict: true,
            variant: 'FindIt',
            challengeService,
            cookieService,
            solved,
            destroyRef,
            setResult,
            setShaking
        })
        expect(cookieService.put).toHaveBeenCalledWith('continueCodeFindIt', 'findItCode', expect.objectContaining({ expires: expect.any(Date) }))
    })

    it('should throw error when continueCode is null', () => {
        challengeService.continueCodeFindIt.mockReturnValue(of(null))
        let thrownError: Error | null = null
        challengeService.continueCodeFindIt.mockReturnValue({
            subscribe: (observer: any) => {
                try {
                    observer.next(null)
                }
                catch (e) {
                    thrownError = e as Error
                }
            }
        })
        handleVerdict({
            verdict: true,
            variant: 'FindIt',
            challengeService,
            cookieService,
            solved,
            destroyRef,
            setResult,
            setShaking
        })
        expect(thrownError).not.toBeNull()
        expect(thrownError!.message).toBe('Received invalid continue code from the server!')
    })

    it('should log error when continueCode observable fails', () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        logSpy.mockClear()
        challengeService.continueCodeFindIt.mockReturnValue(throwError(() => new Error('network error')))
        handleVerdict({
            verdict: true,
            variant: 'FindIt',
            challengeService,
            cookieService,
            solved,
            destroyRef,
            setResult,
            setShaking
        })
        expect(console.log).toHaveBeenCalled()
    })
})
