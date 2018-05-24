import { ContactComponent } from './contact/contact.component';
import { AboutComponent } from './about/about.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { LoginComponent } from './login/login.component';
import { AdministrationComponent } from './administration/administration.component';
import { Routes, RouterModule } from '@angular/router';

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
      path: 'contact',
      component: ContactComponent
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
      path: 'register',
      component: RegisterComponent
    },
    {
      path: 'search',
      component: SearchResultComponent
    },
    {
      path: '**',
      component: SearchResultComponent
    }
];

export const Routing = RouterModule.forRoot(routes);
