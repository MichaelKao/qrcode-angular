import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { WebsocketService } from '../../../services/websocket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

// 定義介面與上一個元件保持一致性
interface ApiResponse {
  data: UserData;
}

interface UserData {
  seq: number;
  account: string;
  password: string;
  email: string | null;
  userStoreVo: UserStore;
}

interface UserStore {
  seq: number;
  storeName: string;
  logo: string | null;
  postCode: string;
  city: string;
  district: string;
  streetAddress: string;
  userProductVoList: Product[];
}

interface Product {
  seq: number;
  productName: string;
  productPrice: number;
  description: string;
  picture: string | null;
  spicy: boolean;
  coriander: boolean;
  vinegar: boolean;
  soldOut: boolean;
}

type SpicyLevel = 'none' | 'small' | 'medium' | 'large';

interface OrderItem {
  product: Product;
  quantity: number;
  spicyLevel?: SpicyLevel;
  wantsCoriander?: boolean;
  wantsVinegar?: boolean;
}

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ShopComponent implements OnInit {
  @Input() storeSeq: number | null = null;
  @Input() tableNum: number | null = null;

  currentProduct: Product | null = null;
  currentSpicyLevel: SpicyLevel = 'none';
  currentCorianderChoice: boolean = false;
  currentVinegarChoice: boolean = false;
  store: UserStore | null = null;
  products: Product[] = [];
  cart: OrderItem[] = [];

  Math = Math;

  constructor(private apiService: ApiService, private websocketService: WebsocketService, private location: Location, private snackBar: MatSnackBar, private router: Router) { }

  ngOnInit() {
    this.loadStoreDetails();
  }

  // loadStoreDetails() {
  //   const userData: UserData = JSON.parse(localStorage.getItem('user') ?? '{}');
  //   this.apiService.showShop(userData.seq).subscribe({
  //     next: (response: ApiResponse) => {
  //       const storeData = response.data.userStoreVo;
  //       this.store = {
  //         ...storeData,
  //         logo: storeData.logo && storeData.logo !== ''
  //           ? (!this.isBase64(storeData.logo)
  //             ? 'data:image/jpeg;base64,' + storeData.logo
  //             : storeData.logo)
  //           : null
  //       };

  //       // 處理商品圖片
  //       this.products = storeData.userProductVoList.map(product => ({
  //         ...product,
  //         picture: product.picture
  //           ? (!this.isBase64(product.picture)
  //             ? 'data:image/jpeg;base64,' + product.picture
  //             : product.picture)
  //           : null

  //       }));
  //     },
  //     error: (error) => {
  //       console.error('載入店家資訊失敗', error);
  //     }
  //   });
  // }

  loadStoreDetails() {
    const userData: UserData = JSON.parse(localStorage.getItem('user') ?? '{}');

    // 直接從 localStorage 獲取產品列表作為備份數據
    const localStorageProducts = userData?.userStoreVo?.userProductVoList || [];
    console.log('localStorage 中的產品數據:', localStorageProducts);

    this.apiService.showShop(userData.seq).subscribe({
      next: (response: ApiResponse) => {
        const storeData = response.data.userStoreVo;
        this.store = {
          ...storeData,
          logo: storeData.logo && storeData.logo !== ''
            ? (!this.isBase64(storeData.logo)
              ? 'data:image/jpeg;base64,' + storeData.logo
              : storeData.logo)
            : null
        };

        // 處理商品圖片並手動設置 soldOut 屬性
        this.products = storeData.userProductVoList.map(product => {
          // 在 localStorage 中尋找匹配的產品來獲取 soldOut 值
          const localProduct = localStorageProducts.find(p => p.seq === product.seq);

          return {
            ...product,
            soldOut: localProduct?.soldOut === true, // 明確設置 soldOut
            picture: product.picture
              ? (!this.isBase64(product.picture)
                ? 'data:image/jpeg;base64,' + product.picture
                : product.picture)
              : null
          };
        });

        console.log('最終處理後的商品列表:', this.products.map(p => ({
          name: p.productName,
          soldOut: p.soldOut
        })));
      },
      error: (error) => {
        console.error('載入店家資訊失敗', error);
      }
    });
  }

  // 與前一個元件保持一致的方法
  isBase64(str: string): boolean {
    return str.startsWith('data:image');
  }

  addToCart(product: Product) {

    if (product.soldOut) {
      return;
    }

    const newItem: OrderItem = {
      product,
      quantity: 1,
      // 根據選擇設置特殊選項
      spicyLevel: product.spicy ? this.currentSpicyLevel : undefined,
      wantsCoriander: product.coriander ? this.currentCorianderChoice : undefined,
      wantsVinegar: product.vinegar ? this.currentVinegarChoice : undefined
    };

    this.cart.push(newItem);

    // 重置臨時選項
    this.currentSpicyLevel = 'none';
    this.currentCorianderChoice = false;
    this.currentVinegarChoice = false;
  }


  updateSpicyLevel(level: string) {
    const validLevels: SpicyLevel[] = ['none', 'small', 'medium', 'large'];

    if (validLevels.includes(level as SpicyLevel)) {
      this.currentSpicyLevel = level as SpicyLevel;
    }
  }

  updateCoriander(wants: boolean) {
    this.currentCorianderChoice = wants;
  }

  updateVinegar(wants: boolean) {
    this.currentVinegarChoice = wants;
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
  }

  calculateTotal(): number {
    return this.cart.reduce((total, item) => total + (item.product.productPrice * item.quantity), 0);
  }

  submitOrder() {
    if (this.cart.length === 0) {
      alert('購物車是空的');
      return;
    }

    // 檢查是否所有特殊選項都已選擇
    const incompleteItems = this.cart.filter(item =>
      (item.product.spicy && item.spicyLevel === undefined) ||
      (item.product.coriander && item.wantsCoriander === undefined) ||
      (item.product.vinegar && item.wantsVinegar === undefined)
    );

    if (incompleteItems.length > 0) {
      alert('請完成所有商品的特殊選項選擇');
      return;
    }

    const orderNum = this.generateOrderId()

    const orderData = {
      orderId: orderNum, // 生成唯一訂單ID
      storeSeq: this.store?.seq,
      tableNum: this.tableNum,
      createTime: new Date().toISOString(),
      status: 'pending',
      items: this.cart.map(item => ({
        productSeq: item.product.seq,
        productName: item.product.productName,
        quantity: item.quantity,
        price: item.product.productPrice,
        spicyLevel: item.spicyLevel || 'none',
        wantsCoriander: item.wantsCoriander,
        wantsVinegar: item.wantsVinegar
      })),
      totalAmount: this.calculateTotal()
    };

    // 直接通過 WebSocket 發送訂單
    this.websocketService.sendOrder(orderData);

    this.snackBar.open('訂單成功送出。訂單編號為:' + orderNum, '關閉', { duration: 3000 });
    this.cart = [];

    // 將訂單資訊存儲到 localStorage
    localStorage.setItem('currentOrder', JSON.stringify(orderData));

    // 延遲3秒後導航到訂單頁面
    setTimeout(() => {
      this.router.navigate(['/order/order-details']);
    }, 3000);
  }

  private generateOrderId(): string {
    // 使用當前日期的簡短表示
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    // 使用當前時間的小時和分鐘
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');

    // 添加一個短的隨機字串（4位）以確保唯一性
    const randomString = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    // 格式：OD-YYMMDD-HHMM-XXXX
    return `OD-${year}${month}${day}-${hour}${minute}-${randomString}`;
  }

  goBack(): void {
    this.location.back();
  }

}