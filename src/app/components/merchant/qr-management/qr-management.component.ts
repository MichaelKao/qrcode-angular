import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-qr-management',
  templateUrl: './qr-management.component.html',
  styleUrl: './qr-management.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    HttpClientModule, 
  ]
})
export class QrManagementComponent implements OnInit {

  qrCodes: any[] = [];

  constructor( private http: HttpClient, private location: Location) {

  }

  getStoreQRCodes() {
    // 安全地存取 localStorage
    if (typeof window !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem('user') ?? '{}');
      if (userData?.userStoreVo?.storeSeq) {
        this.http.get<any>(`http://localhost:8080/qrcode/store/getStoreQRCode/${userData.userStoreVo.storeSeq}`)
          .subscribe({
            next: (response) => {
              this.qrCodes = response;
            },
            error: (error) => {
              console.error('Error fetching QR codes:', error);
            }
          });
      }
    }
  }

  ngOnInit(): void {
    this.getStoreQRCodes();
  }

  goBack(): void {
    this.location.back();
  }

}
