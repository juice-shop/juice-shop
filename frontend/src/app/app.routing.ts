/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TokenSaleComponent } from './token-sale/token-sale.component'
import { OAuthComponent } from './oauth/oauth.component'
import { BasketComponent } from './basket/basket.component'
import { TrackResultComponent } from './track-result/track-result.component'
import { ContactComponent } from './contact/contact.component'
import { AboutComponent } from './about/about.component'
import { RegisterComponent } from './register/register.component'
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component'
import { SearchResultComponent } from './search-result/search-result.component'
import { LoginComponent } from './login/login.component'
import { AdministrationComponent } from './administration/administration.component'
import { ChangePasswordComponent } from './change-password/change-password.component'
import { ComplaintComponent } from './complaint/complaint.component'
import { ChatbotComponent } from './chatbot/chatbot.component'
import { RecycleComponent } from './recycle/recycle.component'
import { RouterModule, type Routes, type UrlMatchResult, type UrlSegment } from '@angular/router'
import { TwoFactorAuthEnterComponent } from './two-factor-auth-enter/two-factor-auth-enter.component'
import { ErrorPageComponent } from './error-page/error-page.component'
import { PrivacySecurityComponent } from './privacy-security/privacy-security.component'
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component'
import { DataExportComponent } from './data-export/data-export.component'
import { LastLoginIpComponent } from './last-login-ip/last-login-ip.component'
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component'
import { AddressCreateComponent } from './address-create/address-create.component'
import { AddressSelectComponent } from './address-select/address-select.component'
import { SavedAddressComponent } from './saved-address/saved-address.component'
import { PaymentComponent } from './payment/payment.component'
import { SavedPaymentMethodsComponent } from './saved-payment-methods/saved-payment-methods.component'
import { AccountingComponent } from './accounting/accounting.component'
import { OrderCompletionComponent } from './order-completion/order-completion.component'
import { OrderSummaryComponent } from './order-summary/order-summary.component'
import { WalletComponent } from './wallet/wallet.component'
import { OrderHistoryComponent } from './order-history/order-history.component'
import { DeliveryMethodComponent } from './delivery-method/delivery-method.component'
import { PhotoWallComponent } from './photo-wall/photo-wall.component'
import { DeluxeUserComponent } from './deluxe-user/deluxe-user.component'
import { AccountingGuard, AdminGuard, LoginGuard } from './app.guard'
import { NFTUnlockComponent } from './nft-unlock/nft-unlock.component'
import { ScoreBoardComponent } from './score-board/score-board.component'

const loadFaucetModule = async () => {
  const module = await import('./faucet/faucet.module')
  return module.FaucetModule
}
const loadWeb3WalletModule = async () => {
  const module = await import('./wallet-web3/wallet-web3.module')
  return module.WalletWeb3Module
}

const loadWeb3SandboxtModule = async () => {
  const module = await import('./web3-sandbox/web3-sandbox.module')
  return module.FaucetModule
}
// vuln-code-snippet start adminSectionChallenge scoreBoardChallenge web3SandboxChallenge
const routes: Routes = [
  { // vuln-code-snippet neutral-line adminSectionChallenge
    path: 'administration', // vuln-code-snippet vuln-line adminSectionChallenge
    component: AdministrationComponent, // vuln-code-snippet neutral-line adminSectionChallenge
    canActivate: [AdminGuard] // vuln-code-snippet neutral-line adminSectionChallenge
  }, // vuln-code-snippet neutral-line adminSectionChallenge
  {
    path: 'accounting',
    component: AccountingComponent,
    canActivate: [AccountingGuard]
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'address/select',
    component: AddressSelectComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'address/saved',
    component: SavedAddressComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'address/create',
    component: AddressCreateComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'address/edit/:addressId',
    component: AddressCreateComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'delivery-method',
    component: DeliveryMethodComponent
  },
  {
    path: 'deluxe-membership',
    component: DeluxeUserComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'saved-payment-methods',
    component: SavedPaymentMethodsComponent
  },
  {
    path: 'basket',
    component: BasketComponent
  },
  {
    path: 'order-completion/:id',
    component: OrderCompletionComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'photo-wall',
    component: PhotoWallComponent
  },
  {
    path: 'complain',
    component: ComplaintComponent
  },
  {
    path: 'chatbot',
    component: ChatbotComponent
  },
  {
    path: 'order-summary',
    component: OrderSummaryComponent
  },
  {
    path: 'order-history',
    component: OrderHistoryComponent
  },
  {
    path: 'payment/:entity',
    component: PaymentComponent
  },
  {
    path: 'wallet',
    component: WalletComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'recycle',
    component: RecycleComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'search',
    component: SearchResultComponent
  },
  {
    path: 'hacking-instructor',
    component: SearchResultComponent
  },
  { // vuln-code-snippet neutral-line scoreBoardChallenge
    path: 'score-board', // vuln-code-snippet vuln-line scoreBoardChallenge
    component: ScoreBoardComponent // vuln-code-snippet neutral-line scoreBoardChallenge
  }, // vuln-code-snippet neutral-line scoreBoardChallenge
  {
    path: 'track-result',
    component: TrackResultComponent
  },
  {
    path: 'track-result/new',
    component: TrackResultComponent,
    data: {
      type: 'new'
    }
  },
  {
    path: '2fa/enter',
    component: TwoFactorAuthEnterComponent
  },
  {
    path: 'privacy-security',
    component: PrivacySecurityComponent,
    children: [
      {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent
      },
      {
        path: 'two-factor-authentication',
        component: TwoFactorAuthComponent
      },
      {
        path: 'data-export',
        component: DataExportComponent
      },
      {
        path: 'last-login-ip',
        component: LastLoginIpComponent
      }
    ]
  },
  {
    path: 'juicy-nft',
    component: NFTUnlockComponent
  },
  {
    path: 'wallet-web3',
    loadChildren: async () => await loadWeb3WalletModule()
  },
  { // vuln-code-snippet neutral-line web3SandboxChallenge
    path: 'web3-sandbox', // vuln-code-snippet vuln-line web3SandboxChallenge
    loadChildren: async () => await loadWeb3SandboxtModule() // vuln-code-snippet neutral-line web3SandboxChallenge
  }, // vuln-code-snippet neutral-line web3SandboxChallenge
  {
    path: 'bee-haven',
    loadChildren: async () => await loadFaucetModule()
  },
  // vuln-code-snippet start tokenSaleChallenge
  {
    matcher: oauthMatcher,
    data: { params: (window.location.href).substr(window.location.href.indexOf('#')) },
    component: OAuthComponent
  },
  { // vuln-code-snippet neutral-line tokenSaleChallenge
    matcher: tokenMatcher, // vuln-code-snippet vuln-line tokenSaleChallenge
    component: TokenSaleComponent // vuln-code-snippet neutral-line tokenSaleChallenge
  }, // vuln-code-snippet neutral-line tokenSaleChallenge
  {
    path: '403',
    component: ErrorPageComponent
  },
  {
    path: '**',
    component: SearchResultComponent
  }
]
// vuln-code-snippet end adminSectionChallenge scoreBoardChallenge web3SandboxChallenge

export const Routing = RouterModule.forRoot(routes, { useHash: true })

export function oauthMatcher (url: UrlSegment[]): UrlMatchResult {
  if (url.length === 0) {
    return null as unknown as UrlMatchResult
  }
  const path = window.location.href
  if (path.includes('#access_token=')) {
    return ({ consumed: url })
  }

  return null as unknown as UrlMatchResult
}

export function tokenMatcher (url: UrlSegment[]): UrlMatchResult { // vuln-code-snippet neutral-line tokenSaleChallenge
  if (url.length === 0) { // vuln-code-snippet neutral-line tokenSaleChallenge
    return null as unknown as UrlMatchResult // vuln-code-snippet neutral-line tokenSaleChallenge
  } // vuln-code-snippet neutral-line tokenSaleChallenge
  // vuln-code-snippet neutral-line tokenSaleChallenge
  const path = url[0].toString() // vuln-code-snippet neutral-line tokenSaleChallenge
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  if (path.match((token1(25, 184, 174, 179, 182, 186) + (36669).toString(36).toLowerCase() + token2(13, 144, 87, 152, 139, 144, 83, 138) + (10).toString(36).toLowerCase()))) { // vuln-code-snippet vuln-line tokenSaleChallenge
    return ({ consumed: url }) // vuln-code-snippet neutral-line tokenSaleChallenge
  } // vuln-code-snippet neutral-line tokenSaleChallenge
  // vuln-code-snippet neutral-line tokenSaleChallenge
  return null as unknown as UrlMatchResult // vuln-code-snippet neutral-line tokenSaleChallenge
} // vuln-code-snippet neutral-line tokenSaleChallenge

export function token1 (...args: number[]) { // vuln-code-snippet neutral-line tokenSaleChallenge
  const L = Array.prototype.slice.call(args) // vuln-code-snippet neutral-line tokenSaleChallenge
  const D = L.shift() // vuln-code-snippet neutral-line tokenSaleChallenge
  return L.reverse().map(function (C, A) { // vuln-code-snippet neutral-line tokenSaleChallenge
    return String.fromCharCode(C - D - 45 - A) // vuln-code-snippet neutral-line tokenSaleChallenge
  }).join('') // vuln-code-snippet neutral-line tokenSaleChallenge
} // vuln-code-snippet neutral-line tokenSaleChallenge

export function token2 (...args: number[]) { // vuln-code-snippet neutral-line tokenSaleChallenge
  const T = Array.prototype.slice.call(arguments) // vuln-code-snippet neutral-line tokenSaleChallenge
  const M = T.shift() // vuln-code-snippet neutral-line tokenSaleChallenge
  return T.reverse().map(function (m, H) { // vuln-code-snippet neutral-line tokenSaleChallenge
    return String.fromCharCode(m - M - 24 - H) // vuln-code-snippet neutral-line tokenSaleChallenge
  }).join('') // vuln-code-snippet neutral-line tokenSaleChallenge
} // vuln-code-snippet neutral-line tokenSaleChallenge
// vuln-code-snippet end tokenSaleChallenge
