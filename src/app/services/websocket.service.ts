import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { Subject, Observable, map } from 'rxjs';
import { Order, OrderStatus, OrderStatusUpdate } from '../components/order-notification/order-notification.component';
import { ApiService } from '../services/api.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private client!: Client;
  private orderSubject = new Subject<Order>();
  private orderStatusSubject = new Subject<OrderStatusUpdate>();
  private isConnected = false;
  private baseUrl = environment.wsUrl;

  constructor(private apiService: ApiService) {
    this.initWebSocket();
  }

  private initWebSocket() {
    this.client = new Client({

      brokerURL: this.baseUrl,
      onConnect: () => {
        console.log('WebSocket Connected');
        this.isConnected = true;
        this.subscribeToOrders();
        this.subscribeToOrderStatus();
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        this.isConnected = false;
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        this.isConnected = false;
      }
    });
  }

  // 添加獲取歷史訂單的方法
  loadInitialOrders(storeId: number): Observable<Order[]> {
    return this.apiService.getOrderInfo(storeId).pipe(
      map(response => {
        if (response.code === 200 && response.data) {
          return response.data;
        }
        return [];
      })
    );
  }

  private subscribeToOrderStatus() {
    this.client.subscribe('/topic/order-status', (message) => {
      try {
        const rawData = JSON.parse(message.body);
        // 確保建立完整的 OrderStatusUpdate 物件
        const statusUpdate: OrderStatusUpdate = {
          orderId: rawData.orderId,
          status: rawData.status as OrderStatus,
          reason: rawData.reason,
          // 如果後端沒有提供 updateTime，則在前端加上
          updateTime: rawData.updateTime || new Date().toISOString()
        };
        this.orderStatusSubject.next(statusUpdate);
      } catch (error) {
        console.error('解析訂單狀態更新失敗:', error);
      }
    });
  }

  connect(storeId?: string) {
    if (!this.isConnected) {
      this.client.activate();
    }
  }

  private subscribeToOrders() {
    this.client.subscribe('/topic/orders', (message) => {
      const orderData = JSON.parse(message.body);
      // 確保轉換狀態為枚舉值
      const order: Order = {
        ...orderData,
        status: orderData.status.toLowerCase() as OrderStatus
      };
      this.orderSubject.next(order);
    });
  }

  // 获取订单通知的可观察对象
  getOrderNotifications(): Observable<Order> {
    return this.orderSubject.asObservable();
  }

  getOrderStatusUpdates(): Observable<OrderStatusUpdate> {
    return this.orderStatusSubject.asObservable();
  }

  disconnect() {
    this.client.deactivate();
  }

  // 发送订单状态更新
  updateOrderStatus(orderId: string, status: OrderStatus, reason?: string) {
    if (!this.isConnected) {
      console.warn('WebSocket未連接');
      return;
    }

    const statusUpdate: OrderStatusUpdate = {
      orderId,
      status,
      reason,
      updateTime: new Date().toISOString()
    };

    this.client.publish({
      destination: '/app/order/status',
      body: JSON.stringify(statusUpdate)  // 直接發送整個物件
    });
  }

  sendOrder(order: any) {
    // 確保連接已建立
    if (!this.isConnected) {
      console.warn('WebSocket not connected. Attempting to connect...');
      this.connect();

      // 使用重試機制
      setTimeout(() => {
        this.sendOrderWithRetry(order);
      }, 1000);
      return;
    }

    this.client.publish({
      destination: '/app/order',
      body: JSON.stringify(order)
    });
  }

  private sendOrderWithRetry(order: any, retries: number = 3) {
    if (retries > 0 && !this.isConnected) {
      setTimeout(() => {
        this.sendOrderWithRetry(order, retries - 1);
      }, 1000);
      return;
    }

    if (this.isConnected) {
      this.client.publish({
        destination: '/app/order',
        body: JSON.stringify(order)
      });
    } else {
      console.error('Unable to send order: WebSocket not connected');
    }
  }

}