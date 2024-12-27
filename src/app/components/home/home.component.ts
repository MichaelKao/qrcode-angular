import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
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
  
  hasStore: boolean = false;

  storeData: any = null;

  qrCodes: any[] = [];


  ngOnInit(): void {
    // 初始檢查
    this.checkUserStatus();
    // 訂閱路由事件，在每次進入該頁面時更新狀態
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkUserStatus();
      }
    });
  }

  checkUserStatus() {
    // 確保 localStorage 可用
    if (typeof localStorage !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem('user') ?? '{}');
      this.account =  userData.account
      this.isLoggedIn = !!this.account;

      if (userData?.userStoreVo) {
        this.hasStore = true;
        this.storeData = userData.userStoreVo;
      } else {
        this.hasStore = false;
        this.storeData = null;
      }

      if (userData?.userStoreVo?.storeSeq) {
        this.qrCodes = userData.userStoreVo.qrCodeVoList;
      }

    }
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('user'); 
    }
    this.account = null;
    this.isLoggedIn = false;
    this.hasStore = false;
    this.storeData = null;
    this.qrCodes = [];
  }

  navigateToMerchantDashboard() {

    const userData = JSON.parse(localStorage.getItem('user') ?? '{}');

    if (userData && userData.account) {
      this.router.navigate(['/merchant/dashboard']);
    } else {
      this.snackBar.open('請先登入', '關閉', { duration: 3000 });
    }
    
  }

  editStore() {
    if (!this.isLoggedIn) {
      this.snackBar.open('請先登入', '關閉', { duration: 3000 });
      return;
    }
    // 導向編輯商店頁面
    this.router.navigate(['/merchant/menu-management']);
  }

  viewStore() {
    if (!this.isLoggedIn) {
      this.snackBar.open('請先登入', '關閉', { duration: 3000 });
      return;
    }
    // 導向編輯商店頁面
    this.router.navigate(['/merchant/qr-management']);
  }

}
