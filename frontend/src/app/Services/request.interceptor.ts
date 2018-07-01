import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { CookieService } from 'ngx-cookie'

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  constructor (private cookieService: CookieService) {}

  intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (localStorage.getItem('token')) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
    }
    if (localStorage.getItem('email')) {
      req = req.clone({
        setHeaders: {
          'X-User-Email': localStorage.get('email')
        }
      })
    }
    return next.handle(req)
  }

}
