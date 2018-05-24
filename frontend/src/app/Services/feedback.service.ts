import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  /*var host = '/api/Feedbacks'

  function find (params) {
    var feedbacks = $q.defer()
    $http.get(host + '/', {
      params: params
    }).then(function (response) {
      feedbacks.resolve(response.data.data)
    }).catch(function (response) {
      feedbacks.reject(response.data)
    })
    return feedbacks.promise
  }

  function save (params) {
    var createdFeedback = $q.defer()
    $http.post(host + '/', params).then(function (response) {
      createdFeedback.resolve(response.data.data)
    }).catch(function (response) {
      createdFeedback.reject(response.data)
    })
    return createdFeedback.promise
  }

  function del (id) {
    var deletedFeedback = $q.defer()
    $http.delete(host + '/' + id).then(function (response) {
      deletedFeedback.resolve(response.data.data)
    }).catch(function (response) {
      deletedFeedback.reject(response.data)
    })
    return deletedFeedback.promise
  }*/

  private hostServer = environment.hostServer;
  private host = this.hostServer + '/api/Feedbacks';

  constructor(private http: HttpClient) { }

  find (params) {
    return this.http.get(this.host + '/' , {
      params: params
    }).pipe(map((response: any) => response.data), catchError((err) => err));
  }

  save (params) {
    return this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError((err) => {throw err; }));
  }

  del (id) {
    return this.http.delete(this.host + '/' + id).pipe(map((response: any) => response.data), catchError((err) => err));
  }
}
