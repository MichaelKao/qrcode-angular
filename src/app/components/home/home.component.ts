import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

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

  account: string | null = '';

  isLoggedIn: boolean = false;


  ngOnInit(): void {
    // 確保 localStorage 可用
    if (typeof localStorage !== 'undefined') {
      this.account = localStorage.getItem('user'); // 從 localStorage 取得帳號
      this.isLoggedIn = !!this.account;
    }

  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('user'); // 移除使用者資料
    }
    this.account = '尚未登入'; // 重置帳號
    this.isLoggedIn = false; // 更新登入狀態
  }

}
