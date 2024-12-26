import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    RouterModule
  ]
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private snackBar: MatSnackBar) {}

  account: string | null = '';

  isLoggedIn: boolean = false;


  ngOnInit(): void {
    // 確保 localStorage 可用
    if (typeof localStorage !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem('user') ?? '{}');
      this.account =  userData.account
      this.isLoggedIn = !!this.account;
    }

  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('user'); 
    }
    this.account = null; 
    this.isLoggedIn = false; 
  }

  navigateToMerchantDashboard() {

    const userData = JSON.parse(localStorage.getItem('user') ?? '{}');

    if (userData && userData.account) {
      this.router.navigate(['/merchant/dashboard']);
    } else {
      this.snackBar.open('請先登入', '關閉', { duration: 3000 });
    }
    
  }

}
