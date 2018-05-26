
/* The service is intended to deliver the same functionality as ng-file-upload */

import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private hostServer = environment.hostServer;
  private host = this.hostServer + '/file-upload';
  constructor(private http: HttpClient) { }

  uploadFile(file: File) {
    const formData: FormData = new FormData();
    formData.append('fileKey', file, file.name);
    return this.http
      .post(this.host, formData, { headers: undefined })
      .pipe(
       map((resp) => resp ),
      catchError((error) => { throw error; } )
      );
  }
}
