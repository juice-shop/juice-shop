/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ResultState, resultIcon, resultColor, handleVerdict } from './coding-challenge.types'
import { of, throwError } from 'rxjs'

describe('coding-challenge.types', () => {
  describe('resultIcon', () => {
    it('should return "send" for Undecided', () => {
      expect(resultIcon(ResultState.Undecided)).toBe('send')
    })

    it('should return "check" for Right', () => {
      expect(resultIcon(ResultState.Right)).toBe('check')
    })

    it('should return "clear" for Wrong', () => {
      expect(resultIcon(ResultState.Wrong)).toBe('clear')
    })
  })

  describe('resultColor', () => {
    it('should return undefined for Undecided', () => {
      expect(resultColor(ResultState.Undecided)).toBeUndefined()
    })

    it('should return "accent" for Right', () => {
      expect(resultColor(ResultState.Right)).toBe('accent')
    })

    it('should return "warn" for Wrong', () => {
      expect(resultColor(ResultState.Wrong)).toBe('warn')
    })
  })

  describe('handleVerdict', () => {
    let challengeService: any
    let cookieService: any
    let solved: any
    let setResult: jasmine.Spy
    let setShaking: jasmine.Spy

    beforeEach(() => {
      challengeService = {
        continueCodeFindIt: jasmine.createSpy('continueCodeFindIt').and.returnValue(of('findItCode')),
        continueCodeFixIt: jasmine.createSpy('continueCodeFixIt').and.returnValue(of('fixItCode'))
      }
      cookieService = jasmine.createSpyObj('CookieService', ['put'])
      solved = jasmine.createSpyObj('OutputEmitterRef', ['emit'])
      setResult = jasmine.createSpy('setResult')
      setShaking = jasmine.createSpy('setShaking')
    })

    it('should set result to Wrong and shaking to true on false verdict', () => {
      handleVerdict({
        verdict: false,
        variant: 'FindIt',
        challengeService,
        cookieService,
        solved,
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
        setResult,
        setShaking
      })
      expect(cookieService.put).toHaveBeenCalledWith('continueCodeFindIt', 'findItCode', jasmine.objectContaining({ expires: jasmine.any(Date) }))
    })

    it('should throw error when continueCode is null', () => {
      challengeService.continueCodeFindIt.and.returnValue(of(null))
      let thrownError: Error | null = null
      challengeService.continueCodeFindIt.and.returnValue({
        subscribe: (observer: any) => {
          try {
            observer.next(null)
          } catch (e) {
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
        setResult,
        setShaking
      })
      expect(thrownError).not.toBeNull()
      expect(thrownError!.message).toBe('Received invalid continue code from the server!')
    })

    it('should log error when continueCode observable fails', () => {
      const logSpy = jasmine.isSpy(console.log) ? (console.log as jasmine.Spy) : spyOn(console, 'log')
      logSpy.calls.reset()
      challengeService.continueCodeFindIt.and.returnValue(throwError(() => new Error('network error')))
      handleVerdict({
        verdict: true,
        variant: 'FindIt',
        challengeService,
        cookieService,
        solved,
        setResult,
        setShaking
      })
      expect(console.log).toHaveBeenCalled()
    })
  })
})
