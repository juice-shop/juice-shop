/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
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
import { ScoreBoardComponent } from './score-board/score-board.component'
import { RouterModule, Routes, UrlMatchResult, UrlSegment } from '@angular/router'
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

// vuln-code-snippet start adminSectionChallenge scoreBoardChallenge
const routes: Routes = [
  {
    path: 'administration', // vuln-code-snippet vuln-line adminSectionChallenge
    component: AdministrationComponent,
    canActivate: [AdminGuard]
  },
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
  {
    path: 'score-board', // vuln-code-snippet vuln-line scoreBoardChallenge
    component: ScoreBoardComponent
  },
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
  // vuln-code-snippet start tokenSaleChallenge
  {
    matcher: oauthMatcher,
    data: { params: (window.location.href).substr(window.location.href.indexOf('#')) },
    component: OAuthComponent
  },
  {
    matcher: tokenMatcher, // vuln-code-snippet vuln-line tokenSaleChallenge
    component: TokenSaleComponent
  },
  {
    path: '403',
    component: ErrorPageComponent
  },
  {
    path: '**',
    component: SearchResultComponent
  }
]
// vuln-code-snippet end adminSectionChallenge scoreBoardChallenge

export const Routing = RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })

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

export function tokenMatcher (url: UrlSegment[]): UrlMatchResult {
  if (url.length === 0) {
    return null as unknown as UrlMatchResult
  }

  const path = url[0].toString()
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  if (path.match((token1(25, 184, 174, 179, 182, 186) + (36669).toString(36).toLowerCase() + token2(13, 144, 87, 152, 139, 144, 83, 138) + (10).toString(36).toLowerCase()))) { // vuln-code-snippet vuln-line tokenSaleChallenge
    return ({ consumed: url })
  }

  return null as unknown as UrlMatchResult
}

export function token1 (...args: number[]) { // vuln-code-snippet vuln-line tokenSaleChallenge
  const L = Array.prototype.slice.call(args)
  const D = L.shift()
  return L.reverse().map(function (C, A) {
    return String.fromCharCode(C - D - 45 - A)
  }).join('')
}

export function token2 (...args: number[]) { // vuln-code-snippet vuln-line tokenSaleChallenge
  const T = Array.prototype.slice.call(arguments)
  const M = T.shift()
  return T.reverse().map(function (m, H) {
    return String.fromCharCode(m - M - 24 - H)
  }).join('')
}
// vuln-code-snippet end tokenSaleChallenge
