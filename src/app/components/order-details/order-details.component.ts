import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // 添加 CommonModule
import { Location } from '@angular/common';

@Component({
  selector: 'app-order-details',
  imports: [CommonModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css',
  standalone: true
})

export class OrderDetailComponent implements OnInit {
  orderData: any = null;
  loading: boolean = false;  // 添加 loading 變數，避免模板中使用未定義的變數

  constructor(private location: Location) { }

  ngOnInit(): void {
    // 從 localStorage 獲取訂單資訊
    const orderJson = localStorage.getItem('currentOrder');
    if (orderJson) {
      this.orderData = JSON.parse(orderJson);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
