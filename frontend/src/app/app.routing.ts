import { BasketComponent } from './basket/basket.component'
import { TrackResultComponent } from './track-result/track-result.component'
import { ContactComponent } from './contact/contact.component'
import { AboutComponent } from './about/about.component'
import { RegisterComponent } from './register/register.component'
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component'
import { SearchResultComponent } from './search-result/search-result.component'
import { LoginComponent } from './login/login.component'
import { AdministrationComponent } from './administration/administration.component'
import { Routes, RouterModule } from '@angular/router'
import { ChangePasswordComponent } from './change-password/change-password.component'
import { ComplaintComponent } from './complaint/complaint.component'
import { TrackOrderComponent } from './track-order/track-order.component'
import { RecycleComponent } from './recycle/recycle.component'

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
    path: 'track-order',
    component: TrackOrderComponent
  },
  {
    path: 'track-result',
    component: TrackResultComponent
  },
  {
    path: '**',
    component: SearchResultComponent
  }
]

export const Routing = RouterModule.forRoot(routes)
