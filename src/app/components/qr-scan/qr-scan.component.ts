import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ShopComponent } from '../merchant/shop/shop.component';

// 定義回應的介面
interface StoreResponse {
  code: number;
  message?: string;
  data?: any;
}

@Component({
  selector: 'app-qr-scan',
  standalone: true,
  imports: [CommonModule, ShopComponent, RouterModule],
  template: `
    <div class="qr-scan-container">
      <div *ngIf="loading" class="loading-state">
        載入中...
      </div>

      <div *ngIf="error" class="error-state">
        {{ error }}
      </div>

      <app-shop 
        *ngIf="storeData && !loading && !error"
        [storeSeq]="storeSeq" 
        [tableNum]="tableNum">
      </app-shop>
    </div>
  `,
  styles: [`
    .qr-scan-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .loading-state {
      text-align: center;
      padding: 40px;
      font-size: 18px;
      color: #666;
    }

    .error-state {
      text-align: center;
      padding: 40px;
      color: #f44336;
      font-size: 16px;
    }
  `]
})
export class QrScanComponent implements OnInit {
  storeSeq: number | null = null;
  tableNum: number | null = null;
  storeData: any = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      if (params['storeSeq'] && params['num']) {
        this.storeSeq = parseInt(params['storeSeq'], 10);
        this.tableNum = parseInt(params['num'], 10);
        
        if (this.storeSeq) {
          this.loadStoreDetails();
        }
      }
    });
  }

  private loadStoreDetails(): void {
    if (this.storeSeq === null || this.tableNum === null) {
      this.error = '無效的店家資訊';
      return;
    }

    this.loading = true;
    this.error = null;

    this.apiService.getOrderInfo(this.storeSeq).subscribe({
      next: (response: StoreResponse) => {
        if (response.code === 200 && response.data) {
          this.storeData = response.data;
        } else {
          this.error = response.message || '無法載入店家資訊';
        }
      },
      error: (error: Error) => {
        console.error('載入店家資訊失敗', error);
        this.error = '載入店家資訊失敗，請稍後再試';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}