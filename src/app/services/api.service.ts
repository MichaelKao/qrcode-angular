import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Store APIs
  updateStore(formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/store/updateStore`, formData);
  }

  createStore(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/store/createStore`, formData);
  }

  // User APIs
  signIn(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/user/signIn`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/user/login`, data);
  }

  // Verification APIs
  sendVerification(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/verification/send/${email}`);
  }

  forgetPassword(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/forgetPassword/${encodeURIComponent(email)}`);
  }

}