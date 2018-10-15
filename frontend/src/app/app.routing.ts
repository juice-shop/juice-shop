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
import { TrackOrderComponent } from './track-order/track-order.component'
import { RecycleComponent } from './recycle/recycle.component'
import { ScoreBoardComponent } from './score-board/score-board.component'
import { RouterModule, Routes, UrlMatchResult, UrlSegment } from '@angular/router'

export function token1 (...args: number[]) {
  let L = Array.prototype.slice.call(args)
  let D = L.shift()
  return L.reverse().map(function (C, A) {
    return String.fromCharCode(C - D - 45 - A)
  }).join('')
}

export function token2 (...args: number[]) {
  let T = Array.prototype.slice.call(arguments)
  let M = T.shift()
  return T.reverse().map(function (m, H) {
    return String.fromCharCode(m - M - 24 - H)
  }).join('')
}

const routes: Routes = [
  {
    path: 'administration',
    component: AdministrationComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'basket',
    component: BasketComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent
  },
  {
    path: 'complain',
    component: ComplaintComponent
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
    path: 'score-board',
    component: ScoreBoardComponent
  },
  {
    path: 'track-order',
    component: TrackOrderComponent
  },
  {
    path: 'track-result',
    component: TrackResultComponent
  },
  {
    matcher: oauthMatcher,
    data: { params: (window.location.href).substr(window.location.href.indexOf('#')) },
    component: OAuthComponent
  },
  {
    matcher: tokenMatcher ,
    component: TokenSaleComponent
  },
  {
    path: '**',
    component: SearchResultComponent
  }
]

export const Routing = RouterModule.forRoot(routes, { useHash: true })

export function oauthMatcher (url: UrlSegment[]): UrlMatchResult {
  if (url.length === 0) {
    return null
  }
  let path = window.location.href
  if (path.includes('#access_token=')) {
    return ({ consumed: url })
  }

  return null
}

export function tokenMatcher (url: UrlSegment[]): UrlMatchResult {
  if (url.length === 0) {
    return null
  }

  const path = url[0].toString()
  if (path.match((token1(25, 184, 174, 179, 182, 186) + (36669).toString(36).toLowerCase() + token2(13, 144, 87, 152, 139, 144, 83, 138) + (10).toString(36).toLowerCase()))) {
    return ({ consumed: url })
  }

  return null
}
