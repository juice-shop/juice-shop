import { CanActivate, Router } from '@angular/router'
import * as jwt_decode from 'jwt-decode'
import { roles } from './roles'

export class AdminGuard implements CanActivate {
  constructor (private router: Router) {}

  forbidRoute () {
    this.router.navigate(['403'], {
      skipLocationChange: true,
      queryParams: {
        error: 'UNAUTHORIZED_PAGE_ACCESS_ERROR'
      }
    })
  }

  tokenDecode () {
    let payload: any = null
    const token = localStorage.getItem('token')
    if (token) {
      payload = jwt_decode(token)
    }
    return payload
  }

  canActivate () {
    let payload = this.tokenDecode()
    if (payload && payload.data && payload.data.role === roles.admin) {
      return true
    } else {
      this.forbidRoute()
      return false
    }
  }
}

export class AccountingGuard implements CanActivate {
  constructor (private router: Router, private adminGuard: AdminGuard) {}

  canActivate () {
    let payload = this.adminGuard.tokenDecode()
    if (payload && payload.data && payload.data.role === roles.accounting) {
      return true
    } else {
      this.adminGuard.forbidRoute()
      return false
    }
  }
}

export class DeluxeGuard {
  constructor (private adminGuard: AdminGuard) {}

  isDeluxe () {
    let payload = this.adminGuard.tokenDecode()
    if (payload && payload.data && payload.data.role === roles.deluxe) {
      return true
    } else {
      return false
    }
  }
}

export class LoginGuard implements CanActivate {
  constructor (private router: Router) {}

  canActivate () {
    if (localStorage.getItem('token')) {
      return true
    } else {
      this.router.navigate(['403'], {
        skipLocationChange: true,
        queryParams: {
          error: 'UNAUTHORIZED_ACCESS_ERROR'
        }
      })
      return false
    }
  }
}
