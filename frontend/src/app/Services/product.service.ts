import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private hostServer = environment.hostServer;
  private host = this.hostServer + '/api/Products';

  constructor(private http: HttpClient) { }

  search (criteria) {
    return this.http.get(this.hostServer + '/rest/product/search?q=' + criteria).pipe(map((response: any) => response.data));
  }

  find (params) {
    return this.http.get(this.host + '/', { params: params }).pipe(map((response: any) => response.data));
  }

  get (id) {
    return this.http.get(this.host + '/' + id + '?d=' + encodeURIComponent(new Date().toDateString())).pipe(map((response: any) =>
    response.data));
  }

}
