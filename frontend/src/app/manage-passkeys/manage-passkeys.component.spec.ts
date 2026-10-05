/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { of, throwError } from 'rxjs'

import { ManagePasskeysComponent } from './manage-passkeys.component'
import { PasskeyService } from '../Services/passkey.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'

describe('ManagePasskeysComponent', () => {
    let component: ManagePasskeysComponent
    let fixture: ComponentFixture<ManagePasskeysComponent>
    let passkeyService: any
    let snackBarHelperService: any

    beforeEach(async () => {
        passkeyService = {
            listCredentials: vi.fn().mockName('PasskeyService.listCredentials'),
            registerOptions: vi.fn().mockName('PasskeyService.registerOptions'),
            registerVerify: vi.fn().mockName('PasskeyService.registerVerify'),
            deleteCredential: vi.fn().mockName('PasskeyService.deleteCredential'),
            createAttestation: vi.fn().mockName('PasskeyService.createAttestation')
        }
        passkeyService.listCredentials.mockReturnValue(of([]))
        snackBarHelperService = { open: vi.fn().mockName('SnackBarHelperService.open') }

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ManagePasskeysComponent],
            providers: [
                { provide: PasskeyService, useValue: passkeyService },
                { provide: SnackBarHelperService, useValue: snackBarHelperService }
            ]
        }).compileComponents()

        fixture = TestBed.createComponent(ManagePasskeysComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
        await fixture.whenStable()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should load the credentials of the current user on init', async () => {
        passkeyService.listCredentials.mockReturnValue(of([{ id: 1, credentialID: 'cred', transports: 'internal' }]))
        component.ngOnInit()
        await fixture.whenStable()
        expect(component.credentials()).toEqual([{ id: 1, credentialID: 'cred', transports: 'internal' }])
    })

    it('should log when the credentials cannot be loaded', async () => {
        console.log = vi.fn()
        passkeyService.listCredentials.mockReturnValue(throwError(() => ({ status: 500 })))
        await component.loadCredentials()
        expect(console.log).toHaveBeenCalledWith('Failed to fetch passkeys')
    })

    it('should register a new passkey, refresh the list and confirm via snackbar', async () => {
        passkeyService.registerOptions.mockReturnValue(of({ options: { challenge: 'c' }, regToken: 'regToken' }))
        passkeyService.createAttestation.mockResolvedValue({ id: 'cred' })
        passkeyService.registerVerify.mockReturnValue(of(undefined))
        passkeyService.listCredentials.mockReturnValue(of([{ id: 1, credentialID: 'cred', transports: 'internal' }]))

        await component.addPasskey()

        expect(passkeyService.createAttestation).toHaveBeenCalledWith({ challenge: 'c' })
        expect(passkeyService.registerVerify).toHaveBeenCalledWith({ id: 'cred' }, 'regToken')
        expect(component.credentials()).toHaveLength(1)
        expect(snackBarHelperService.open).toHaveBeenCalledWith('CONFIRM_PASSKEY_ADDED', 'confirmBar')
        expect(component.busy()).toBe(false)
    })

    it('should show the server error when the registration is not verified', async () => {
        passkeyService.registerOptions.mockReturnValue(of({ options: {}, regToken: 'regToken' }))
        passkeyService.createAttestation.mockResolvedValue({ id: 'cred' })
        passkeyService.registerVerify.mockReturnValue(throwError(() => ({ error: { error: 'not verified' } })))

        await component.addPasskey()

        expect(component.error()).toBe('not verified')
        expect(snackBarHelperService.open).not.toHaveBeenCalled()
        expect(component.busy()).toBe(false)
    })

    it('should show the browser error when the passkey prompt is cancelled', async () => {
        passkeyService.registerOptions.mockReturnValue(of({ options: {}, regToken: 'regToken' }))
        passkeyService.createAttestation.mockRejectedValue(new Error('The operation was not allowed'))

        await component.addPasskey()

        expect(component.error()).toBe('The operation was not allowed')
        expect(passkeyService.registerVerify).not.toHaveBeenCalled()
    })

    it('should remove a passkey, refresh the list and confirm via snackbar', async () => {
        component.credentials.set([{ id: 1, credentialID: 'cred', transports: '' }])
        passkeyService.deleteCredential.mockReturnValue(of(undefined))
        passkeyService.listCredentials.mockReturnValue(of([]))

        await component.removePasskey(1)

        expect(passkeyService.deleteCredential).toHaveBeenCalledWith(1)
        expect(component.credentials()).toEqual([])
        expect(snackBarHelperService.open).toHaveBeenCalledWith('CONFIRM_PASSKEY_REMOVED', 'confirmBar')
    })

    describe('template rendering', () => {
        it('should show the empty state when no passkeys are registered', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('#no-passkeys')).toBeTruthy()
            expect(compiled.querySelector('#passkey-list')).toBeNull()
        })

        it('should render one list entry per registered passkey', () => {
            component.credentials.set([
                { id: 1, credentialID: 'credA', transports: 'internal' },
                { id: 2, credentialID: 'credB', transports: '' }
            ])
            fixture.detectChanges()
            const items = (fixture.nativeElement as HTMLElement).querySelectorAll('.passkey-item')
            expect(items).toHaveLength(2)
            expect(items[0].textContent).toContain('credA')
            expect(items[0].textContent).toContain('internal')
        })

        it('should invoke removePasskey with the credential id when the remove button is clicked', () => {
            const removeSpy = vi.spyOn(component, 'removePasskey').mockResolvedValue(undefined)
            component.credentials.set([{ id: 7, credentialID: 'cred', transports: '' }])
            fixture.detectChanges()
            const button = (fixture.nativeElement as HTMLElement).querySelector('.remove-passkey') as HTMLButtonElement
            button.click()
            expect(removeSpy).toHaveBeenCalledWith(7)
        })

        it('should invoke addPasskey when the add button is clicked and disable it while busy', () => {
            const addSpy = vi.spyOn(component, 'addPasskey').mockResolvedValue(undefined)
            const button = (fixture.nativeElement as HTMLElement).querySelector('#addPasskey') as HTMLButtonElement
            button.click()
            expect(addSpy).toHaveBeenCalled()
            component.busy.set(true)
            fixture.detectChanges()
            expect(button.disabled).toBe(true)
        })

        it('should show the error message banner when an error is set', () => {
            component.error.set('not verified')
            fixture.detectChanges()
            const errorEl = (fixture.nativeElement as HTMLElement).querySelector('.error')
            expect(errorEl?.textContent).toContain('not verified')
            expect(errorEl?.getAttribute('role')).toBe('alert')
        })
    })
})
