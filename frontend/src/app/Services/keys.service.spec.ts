/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { KeysService } from './keys.service'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('KeysService', () => {
  let service: KeysService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        KeysService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
    service = TestBed.inject(KeysService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should get nftUnlocked directly from the rest api', () => {
    service.nftUnlocked().subscribe((res) => {
      expect(res).toBe('apiResponse')
    })
    const req = httpMock.expectOne('http://localhost:3000/rest/web3/nftUnlocked')
    expect(req.request.method).toBe('GET')
    req.flush('apiResponse')
  })

  it('should get nftMintListen directly from the rest api', () => {
    service.nftMintListen().subscribe((res) => {
      expect(res).toBe('apiResponse')
    })
    const req = httpMock.expectOne('http://localhost:3000/rest/web3/nftMintListen')
    expect(req.request.method).toBe('GET')
    req.flush('apiResponse')
  })

  it('should checkNftMinted directly from the rest api', () => {
    service.checkNftMinted().subscribe((res) => {
      expect(res).toBe('apiResponse')
    })
    const req = httpMock.expectOne('http://localhost:3000/api/Challenges/?key=nftMintChallenge')
    expect(req.request.method).toBe('GET')
    req.flush('apiResponse')
  })

  it('should post submitKey directly to the rest api', () => {
    service.submitKey('privateKey').subscribe((res) => {
      expect(res).toBe('apiResponse')
    })
    const req = httpMock.expectOne('http://localhost:3000/rest/web3/submitKey')
    expect(req.request.method).toBe('POST')
    expect(req.request.body).toEqual({ privateKey: 'privateKey' })
    req.flush('apiResponse')
  })

  it('should post verifyNFTWallet directly to the rest api', () => {
    service.verifyNFTWallet('walletAddress').subscribe((res) => {
      expect(res).toBe('apiResponse')
    })
    const req = httpMock.expectOne('http://localhost:3000/rest/web3/walletNFTVerify')
    expect(req.request.method).toBe('POST')
    expect(req.request.body).toEqual({ walletAddress: 'walletAddress' })
    req.flush('apiResponse')
  })

  it('should post walletAddressSend directly to the rest api', () => {
    service.walletAddressSend('walletAddress').subscribe((res) => {
      expect(res).toBe('apiResponse')
    })
    const req = httpMock.expectOne('http://localhost:3000/rest/web3/walletExploitAddress')
    expect(req.request.method).toBe('POST')
    expect(req.request.body).toEqual({ walletAddress: 'walletAddress' })
    req.flush('apiResponse')
  })

  it('should handle error in nftUnlocked', () => {
    let capturedError: any
    service.nftUnlocked().subscribe({ next: () => expect(true).toBe(false), error: (e) => { capturedError = e } })
    const req = httpMock.expectOne('http://localhost:3000/rest/web3/nftUnlocked')
    req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })
    expect(capturedError.status).toBe(500)
  })

  it('should handle error in nftMintListen', () => {
    let capturedError: any
    service.nftMintListen().subscribe({ next: () => expect(true).toBe(false), error: (e) => { capturedError = e } })
    const req = httpMock.expectOne('http://localhost:3000/rest/web3/nftMintListen')
    req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })
    expect(capturedError.status).toBe(500)
  })

  it('should handle error in checkNftMinted', () => {
    let capturedError: any
    service.checkNftMinted().subscribe({ next: () => expect(true).toBe(false), error: (e) => { capturedError = e } })
    const req = httpMock.expectOne('http://localhost:3000/api/Challenges/?key=nftMintChallenge')
    req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })
    expect(capturedError.status).toBe(500)
  })

  it('should handle error in submitKey', () => {
    let capturedError: any
    service.submitKey('privateKey').subscribe({ next: () => expect(true).toBe(false), error: (e) => { capturedError = e } })
    const req = httpMock.expectOne('http://localhost:3000/rest/web3/submitKey')
    req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })
    expect(capturedError.status).toBe(500)
  })

  it('should handle error in verifyNFTWallet', () => {
    let capturedError: any
    service.verifyNFTWallet('walletAddress').subscribe({ next: () => expect(true).toBe(false), error: (e) => { capturedError = e } })
    const req = httpMock.expectOne('http://localhost:3000/rest/web3/walletNFTVerify')
    req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })
    expect(capturedError.status).toBe(500)
  })

  it('should handle error in walletAddressSend', () => {
    let capturedError: any
    service.walletAddressSend('walletAddress').subscribe({ next: () => expect(true).toBe(false), error: (e) => { capturedError = e } })
    const req = httpMock.expectOne('http://localhost:3000/rest/web3/walletExploitAddress')
    req.error(new ErrorEvent('Request failed'), { status: 500, statusText: 'Internal Server Error' })
    expect(capturedError.status).toBe(500)
  })
})
