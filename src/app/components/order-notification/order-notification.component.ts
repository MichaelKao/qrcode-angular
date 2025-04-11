import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { WebsocketService } from '../../services/websocket.service';

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  spicyLevel?: 'none' | 'small' | 'medium' | 'large';
  wantsCoriander?: boolean;
  wantsVinegar?: boolean;
}

export interface Order {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  createTime: string;
  status: OrderStatus;
  tableNum: number;
  updateTime?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  reason?: string;
  updateTime: string;
}

@Component({
  selector: 'app-order-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="order-notifications">
      <button class="back-button" (click)="goBack()">
        返回
      </button>
      <div class="notification-header">
        <h2>訂單通知</h2>
        <div class="filter-buttons">
          <button [class.active]="filter === 'all'" 
                  (click)="setFilter('all')">全部</button>
          <button [class.active]="filter === 'pending'" 
                  (click)="setFilter('pending')">待處理</button>
          <button [class.active]="filter === 'accepted'" 
                  (click)="setFilter('accepted')">已接受</button>
        </div>
      </div>

      <div class="notification-list">
        <div *ngFor="let orderItem of filteredOrders$ | async" 
             class="order-item" 
             [class]="'status-' + orderItem.status">
          
          <div class="order-header">
            <span class="order-id">訂單 #{{orderItem.orderId}}</span>
            <span class="order-time">{{orderItem.createTime | date:'yyyy/MM/dd HH:mm:ss':'Asia/Taipei'}}</span>
            <span class="order-status">{{getStatusText(orderItem.status)}}</span>
          </div>

          <div class="table-number">
            <span class="table-tag" 
                  [class.delivery-tag]="orderItem.tableNum === 0"
                  [class.takeout-tag]="orderItem.tableNum === null">
              {{ orderItem.tableNum === 0 ? '外帶' : 
                 orderItem.tableNum === null ? '外帶' : 
                 '座位:' + orderItem.tableNum }}
            </span>
          </div>

          <div class="order-details">
            <div *ngFor="let item of orderItem.items" class="item-detail">
              <div class="item-name">
                <span>{{item.productName}}</span>
                <span class="quantity">x {{item.quantity}}</span>
              </div>
              <div class="item-options">
                <span *ngIf="item.spicyLevel" class="option spicy">
                  {{getSpicyLevelText(item.spicyLevel)}}
                </span>
                <span *ngIf="item.wantsCoriander" class="option coriander">香菜</span>
                <span *ngIf="item.wantsVinegar" class="option vinegar">醋</span>
              </div>
            </div>
          </div>

          <div class="order-total">
            <span>總金額：NT$ {{orderItem.totalAmount}}</span>
          </div>

          <div *ngIf="orderItem.status === 'pending'" class="order-actions">
            <button class="accept" (click)="acceptOrder(orderItem.orderId)">
              接受訂單
            </button>
            <button class="reject" (click)="rejectOrder(orderItem.orderId)">
              拒絕訂單
            </button>
          </div>
        </div>

        <div *ngIf="(filteredOrders$ | async)?.length === 0" class="empty-state">
          目前沒有訂單
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-notifications {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      position: relative;
    }

    .back-button {
      position: absolute;
      top: 20px;
      left: 20px;
      padding: 8px 16px;
      background-color: #666;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .back-button:hover {
        background-color: #555;
    }

    .notification-header {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .notification-header h2 {
      font-size: 24px;
      font-weight: bold;
    }

    .filter-buttons {
      display: flex;
      gap: 10px;
    }

    .filter-buttons button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background-color: #e0e0e0;
      cursor: pointer;
    }

    .filter-buttons button.active {
      background-color: #2196f3;
      color: white;
    }

    .order-item {
      background-color: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .status-pending {
      border-left: 4px solid #ffd700;
    }

    .status-accepted {
      border-left: 4px solid #4caf50;
    }

    .status-rejected {
      border-left: 4px solid #f44336;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .order-id {
      font-weight: bold;
    }

    .order-time {
      color: #666;
    }

    .table-number {
      margin-bottom: 12px;
    }

    .item-detail {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background-color: #f5f5f5;
      margin-bottom: 8px;
      border-radius: 4px;
    }

    .quantity {
      margin-left: 8px;
      color: #666;
    }

    .item-options {
      display: flex;
      gap: 8px;
    }

    .option {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .option.spicy {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .option.coriander {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .option.vinegar {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .order-total {
      text-align: right;
      font-weight: bold;
      margin: 12px 0;
    }

    .order-actions {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }

    .order-actions button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .order-actions .accept {
      background-color: #4caf50;
      color: white;
    }

    .order-actions .reject {
      background-color: #f44336;
      color: white;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class OrderNotificationComponent implements OnInit, OnDestroy {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private filteredOrdersSubject = new BehaviorSubject<Order[]>([]);  // 改用 Subject
  filteredOrders$ = this.filteredOrdersSubject.asObservable();  // 只暴露 Observable
  filter: 'all' | 'pending' | 'accepted' = 'all';
  private subscriptions = new Subscription();

  constructor(private websocketService: WebsocketService, private location: Location) { }

  ngOnInit(): void {
    this.websocketService.connect();
    const userData = JSON.parse(localStorage.getItem('user') ?? '{}');

    if (userData.userStoreVo.seq) {
      this.subscriptions.add(
        this.websocketService.loadInitialOrders(userData.userStoreVo.seq).subscribe({
          next: (orders) => {
            if (orders && orders.length > 0) {
              this.ordersSubject.next(orders);
              this.updateFilteredOrders();
            }
          },
          error: (error) => {
            console.error('載入訂單失敗:', error);
          }
        })
      );
    }

    // 訂閱新訂單
    this.subscriptions.add(
      this.websocketService.getOrderNotifications().subscribe(
        (order: Order) => {
          const currentOrders = this.ordersSubject.value;
          this.ordersSubject.next([...currentOrders, order]);
          this.updateFilteredOrders();
          this.playNotificationSound();
        }
      )
    );

    // 訂閱訂單狀態更新
    this.subscriptions.add(
      this.websocketService.getOrderStatusUpdates().subscribe(
        (update) => {
          this.updateLocalOrderStatus(update.orderId, update.status);
        }
      )
    );

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.websocketService.disconnect();
    this.ordersSubject.complete();
    this.filteredOrdersSubject.complete();  // 完成 Subject
  }

  setFilter(newFilter: 'all' | 'pending' | 'accepted'): void {
    this.filter = newFilter;
    this.updateFilteredOrders();
  }

  getSpicyLevelText(level: string): string {
    const levelMap: { [key: string]: string } = {
      none: '不辣',
      small: '小辣',
      medium: '中辣',
      large: '大辣'
    };
    return levelMap[level] || '未知';
  }

  acceptOrder(orderId: string): void {
    if (confirm('確定要接受這筆訂單嗎？')) {
      this.websocketService.updateOrderStatus(orderId, OrderStatus.ACCEPTED);
    }
  }

  rejectOrder(orderId: string): void {
    const reason = prompt('請輸入拒絕原因：');
    if (reason !== null) {
      this.websocketService.updateOrderStatus(orderId, OrderStatus.REJECTED, reason);
    }
  }

  private updateLocalOrderStatus(orderId: string, newStatus: OrderStatus): void {
    const currentOrders = this.ordersSubject.value;
    const updatedOrders = currentOrders.map(order =>
      order.orderId === orderId
        ? { ...order, status: newStatus, updateTime: new Date().toISOString() }
        : order
    );
    this.ordersSubject.next(updatedOrders);
    this.updateFilteredOrders();
  }

  private updateFilteredOrders(): void {
    const allOrders = this.ordersSubject.value;
    const filtered = this.filter === 'all'
      ? allOrders
      : allOrders.filter(order => order.status === this.filter);
    this.filteredOrdersSubject.next(filtered);  // 使用 Subject 的 next 方法
  }

  private playNotificationSound(): void {
    const audio = new Audio('assets/notification.mp3');
    audio.play().catch(error => console.error('播放通知音效失敗:', error));
  }

  getStatusText(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: '待處理',
      [OrderStatus.ACCEPTED]: '已接受',
      [OrderStatus.REJECTED]: '已拒絕',
      [OrderStatus.COMPLETED]: '已完成',
      [OrderStatus.CANCELLED]: '已取消'
    };
    return statusMap[status] || '未知狀態';
  }

  goBack(): void {
    this.location.back();
  }

}