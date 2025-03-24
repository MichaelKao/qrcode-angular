import { Component, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

// API 回傳的資料結構介面
interface ApiResponse {
  data: UserData;
}

// 使用者資料介面
interface UserData {
  seq: number;
  account: string;
  password: string;
  email: string | null;
  userStoreVo: UserStore;
}

// 商店資料介面
interface UserStore {
  seq: number;
  storeSeq: number;
  storeName: string;
  description: string;
  phone: string;
  email: string;
  postCode: string;
  city: string;
  district: string;
  streetAddress: string;
  logo: string;
  seats: number;
  qrcode: string | null;
  createTime: string;
  updateTime: string;
  userProductVoList: Product[];
}

// 商品資料介面
interface Product {
  seq: number;
  productSeq: number;
  productName: string;
  productPrice: number;
  description: string;
  spicy: boolean;
  coriander: boolean;
  vinegar: boolean;
  picture?: string | null;
  createTime?: string;
  updateTime?: string;
}

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProductManagementComponent {

  @ViewChild('addForm') addForm!: ElementRef;
  @ViewChild('productsList') productsList!: ElementRef;

  productForm!: FormGroup;
  selectedFileName: string = '';
  products: Product[] = []; // 使用 Product 介面
  editingIndex: number = -1;
  private selectedFile: File | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {
    this.initForm();
    // 在建構函數中重新載入商品列表
    setTimeout(() => {
      this.refreshProductList();
    }, 0);
  }

  // 在更新後強制觸發變更檢測
  private refreshProductList(): void {
    console.log('開始重新整理商品列表');
    const userData: UserData = JSON.parse(localStorage.getItem('user') ?? '{}');
    console.log('從 localStorage 讀取的數據:', userData);

    if (userData?.userStoreVo?.userProductVoList) {
      this.products = userData.userStoreVo.userProductVoList.map(product => {
        const processedProduct = {
          ...product,
          picture: product.picture
            ? (!this.isBase64(product.picture)
              ? 'data:image/jpeg;base64,' + product.picture
              : product.picture)
            : null
        };
        console.log('處理後的商品:', processedProduct);
        return processedProduct;
      });

      console.log('更新後的商品列表:', this.products);

      // 強制更新視圖
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    } else {
      console.log('沒有找到商品列表數據');
    }
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      productPrice: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      spicy: [false],
      coriander: [false],
      vinegar: [false]
    });
  }

  ngOnInit() {
    const userData: UserData = JSON.parse(localStorage.getItem('user') ?? '{}');
    if (userData?.userStoreVo?.userProductVoList) {
      // 處理商品列表中的圖片
      this.products = userData.userStoreVo.userProductVoList.map(product => {
        // 檢查圖片是否存在且需要加上前綴
        if (product.picture) {
          const base64Prefix = 'data:image/jpeg;base64,';
          // 如果已經有前綴就不加，沒有才加
          const imageData = product.picture.startsWith(base64Prefix)
            ? product.picture
            : base64Prefix + product.picture;
          return { ...product, picture: imageData };
        }
        return product;
      });
      console.log('載入的商品列表:', this.products);
    }
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    console.error('圖片載入失敗:', img.src);
    img.style.display = 'none';
    // 或者顯示預設圖片
    // img.src = 'assets/images/default-product.png';
  }

  isBase64(str: string): boolean {
    return str.startsWith('data:image');
  }

  editProduct(index: number): void {
    const product = this.products[index];
    this.editingIndex = index;
    this.productForm.patchValue(product);
    this.selectedFileName = product.picture ? '已有圖片' : '';

    setTimeout(() => {
      this.addForm.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

  deleteProduct(index: number): void {
    if (confirm('確定要刪除此商品嗎？')) {
      this.isLoading = true;
      const product = this.products[index];

      if (!product || !product.seq) {
        console.error('商品序號不存在');
        this.isLoading = false;  // 記得在錯誤時關閉 loading
        alert('刪除商品失敗：商品資訊不完整');
        return;
      }

      this.apiService.deleteProduct(product.seq).subscribe({
        next: (response) => {
          // 更新本地列表
          this.products = this.products.filter((_, i) => i !== index);

          // 更新 localStorage
          const userData: UserData = JSON.parse(localStorage.getItem('user') ?? '{}');
          if (userData?.userStoreVo?.userProductVoList) {
            userData.userStoreVo.userProductVoList = userData.userStoreVo.userProductVoList
              .filter(p => p.seq !== product.seq);
            localStorage.setItem('user', JSON.stringify(userData));
          }

          // 先關閉 loading 再顯示成功訊息
          this.isLoading = false;

          // 強制更新視圖
          this.cdr.markForCheck();
          this.cdr.detectChanges();

          // 最後才顯示成功訊息
          setTimeout(() => {
            alert('商品已成功刪除');
          }, 100);
        },
        error: (error) => {
          console.error('刪除商品失敗:', error);
          this.isLoading = false;  // 記得在錯誤時也要關閉 loading
          alert('刪除商品失敗，請稍後再試');
        },
        complete: () => {
          // 確保在所有情況下都會關閉 loading
          this.isLoading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSubmit(): void {

    // 檢查必填欄位
    if (this.productForm.invalid) {
      if (this.productForm.get('productName')?.errors) {
        alert('請輸入商品名稱');
        return;
      }
      if (this.productForm.get('productPrice')?.errors) {
        alert('請輸入商品價格');
        return;
      }
      return;
    }

    this.isLoading = true;

    if (this.productForm.valid) {
      const productData = this.productForm.value;
      const userData: UserData = JSON.parse(localStorage.getItem('user') ?? '{}');
      let formData = new FormData();  // 改用 let 並初始化

      const isEditing = this.editingIndex >= 0;

      if (isEditing) {
        const currentProduct = this.products[this.editingIndex];
        formData.append('seq', currentProduct.seq.toString());
        formData.append('productSeq', currentProduct.productSeq.toString());

        // 添加表單數據
        Object.keys(productData).forEach(key => {
          formData.append(key, productData[key].toString());
        });

        // 處理圖片邏輯
        if (this.selectedFile) {
          // 如果選擇了新圖片，使用新圖片
          formData.append('pictureFile', this.selectedFile);
        } else if (currentProduct.picture) {
          // 如果沒有選新圖片，但有原圖，則將原圖轉成 File 後傳送
          try {
            const base64Data = currentProduct.picture.startsWith('data:image/jpeg;base64,')
              ? currentProduct.picture.split(',')[1]
              : currentProduct.picture;

            // 創建一個新的 Blob 物件
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });

            // 將 Blob 轉換為 File 物件並傳送
            const pictureFile = new File([blob], 'current-image.jpg', { type: 'image/jpeg' });
            formData.append('pictureFile', pictureFile);

            console.log('保留原圖片並轉換為文件');
          } catch (error) {
            console.error('轉換原圖片失敗:', error);
            this.isLoading = false;
          }
        }

        this.apiService.updateProduct(formData).subscribe({
          next: (response: ApiResponse) => {
            console.log('API回傳的資料:', response.data);

            // 從 response 中取得更新後的商品資料
            const updatedProductData = response.data.userStoreVo.userProductVoList
              .find(p => p.seq === currentProduct.seq);

            if (!updatedProductData) {
              console.error('找不到更新後的商品資料');
              this.isLoading = false;
              return;
            }

            // 建立更新後的商品物件
            const updatedProduct: Product = {
              seq: updatedProductData.seq,
              productSeq: updatedProductData.productSeq,
              productName: updatedProductData.productName,
              productPrice: updatedProductData.productPrice,
              description: updatedProductData.description,
              spicy: updatedProductData.spicy,
              coriander: updatedProductData.coriander,
              vinegar: updatedProductData.vinegar,
              picture: updatedProductData.picture
                ? (!this.isBase64(updatedProductData.picture)
                  ? 'data:image/jpeg;base64,' + updatedProductData.picture
                  : updatedProductData.picture)
                : null,
              createTime: updatedProductData.createTime,
              updateTime: updatedProductData.updateTime
            };

            // 更新陣列中的商品
            this.products[this.editingIndex] = updatedProduct;

            // 創建新的參考以觸發變更檢測
            this.products = [...this.products];

            // 更新 localStorage
            localStorage.setItem('user', JSON.stringify(response.data));

            // 強制更新視圖
            this.cdr.markForCheck();
            this.cdr.detectChanges();

            this.resetForm(true);
          },
          error: (error) => {
            console.error('更新商品失敗:', error);
            this.isLoading = false;
            alert('更新商品失敗，請稍後再試');
          }
        });
      } else {
        // 新增商品
        formData = new FormData();  // 重新初始化 FormData

        // 加入必要的資料
        formData.append('productSeq', userData.seq.toString());

        // 添加表單數據
        Object.keys(productData).forEach(key => {
          formData.append(key, productData[key].toString());
        });

        // 只有在確實選擇了新圖片時才添加
        if (this.selectedFile) {
          formData.append('pictureFile', this.selectedFile);
        }

        this.apiService.createProduct(formData).subscribe({
          next: (response: ApiResponse) => {
            if (!response.data?.userStoreVo?.userProductVoList) {
              console.error('找不到商品資料');
              this.isLoading = false;
              return;
            }

            const newProductData = response.data.userStoreVo.userProductVoList[0];

            // 直接使用後端返回的完整列表
            this.products = response.data.userStoreVo.userProductVoList.map(product => ({
              ...product,
              picture: product.picture
                ? (!this.isBase64(product.picture)
                  ? 'data:image/jpeg;base64,' + product.picture
                  : product.picture)
                : null
            }));

            // 更新 localStorage
            localStorage.setItem('user', JSON.stringify(response.data));

            // 強制更新視圖
            this.cdr.markForCheck();
            this.cdr.detectChanges();

            // 重置表單
            this.resetForm(false);
          },
          error: (error) => {
            console.error('新增商品失敗:', error);
            this.isLoading = false;
            alert('新增商品失敗，請稍後再試');
          }
        });
      }
    }
  }


  // 新增重置表單的方法
  private resetForm(isUpdate: boolean): void {
    this.isLoading = false;
    // 先顯示訊息
    alert(isUpdate ? '商品更新成功' : '商品新增成功');

    // 完全重置表單
    this.productForm.reset();

    // 設置默認值
    this.productForm.patchValue({
      spicy: false,
      coriander: false,
      vinegar: false,
      description: '',
      productName: '',
      productPrice: ''
    });

    // 清空文件選擇
    this.selectedFileName = '';
    this.selectedFile = null;

    // 重置編輯狀態
    if (isUpdate) {
      this.editingIndex = -1;
    }

    // 強制更新視圖
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    // 滾動到商品列表
    setTimeout(() => {
      this.productsList.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // 記錄原始文件大小
      console.log('原始文件大小:', file.size / 1024, 'KB');
      
      // 檢查文件類型
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('只支持 JPG 和 PNG 格式的圖片');
        event.target.value = '';
        return;
      }
      
      // 無論文件大小如何，都進行壓縮以確保小於1MB
      this.compressImage(file).then(compressedFile => {
        console.log('處理後文件大小:', compressedFile.size / 1024, 'KB');
        
        // 如果壓縮後仍然超過1MB，進一步壓縮
        if (compressedFile.size > 1 * 1024 * 1024) {
          console.log('文件仍然過大，進一步壓縮');
          return this.furtherCompressImage(compressedFile);
        }
        
        return compressedFile;
      }).then(finalFile => {
        console.log('最終文件大小:', finalFile.size / 1024, 'KB');
        this.selectedFile = finalFile;
        this.selectedFileName = file.name;
      }).catch(error => {
        console.error('圖片處理失敗:', error);
        alert('圖片處理失敗，請選擇較小的圖片或不同格式');
      });
    }
    event.target.value = '';
  }
  
  compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          // 創建canvas來壓縮圖片
          const canvas = document.createElement('canvas');
          // 計算新的尺寸，保持原比例
          let width = img.width;
          let height = img.height;
          
          // 根據原始文件大小動態調整目標尺寸
          const MAX_WIDTH = file.size > 2 * 1024 * 1024 ? 800 : 1200; // 超過2MB用更小的尺寸
          const MAX_HEIGHT = file.size > 2 * 1024 * 1024 ? 800 : 1200;
          
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
          
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // 繪製圖片到canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('無法獲取 canvas 上下文'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // 根據原始文件大小動態調整壓縮品質
          let quality = 0.7;
          if (file.size > 2 * 1024 * 1024) quality = 0.5; // 大於2MB
          else if (file.size > 1 * 1024 * 1024) quality = 0.6; // 大於1MB
          
          // 轉換為blob
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('無法將 canvas 轉換為 blob'));
              return;
            }
            // 創建新的文件對象
            const compressedFile = new File([blob], file.name, { 
              type: 'image/jpeg', // 統一轉換為jpeg以提高壓縮率
              lastModified: Date.now() 
            });
            resolve(compressedFile);
          }, 'image/jpeg', quality); // 使用jpeg格式和動態品質
        };
        
        img.onerror = () => {
          reject(new Error('圖片加載失敗'));
        };
        
        img.src = event.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('文件讀取失敗'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  // 如果第一次壓縮後仍然超過1MB，進行更激進的壓縮
  furtherCompressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // 更激進地縮小尺寸
          let width = img.width;
          let height = img.height;
          
          // 設置更小的最大尺寸
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
          
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('無法獲取 canvas 上下文'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // 使用更低的品質
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('無法將 canvas 轉換為 blob'));
              return;
            }
            const furtherCompressedFile = new File([blob], file.name, { 
              type: 'image/jpeg',
              lastModified: Date.now() 
            });
            resolve(furtherCompressedFile);
          }, 'image/jpeg', 0.4); // 更低的品質
        };
        
        img.onerror = () => {
          reject(new Error('圖片加載失敗'));
        };
        
        img.src = event.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('文件讀取失敗'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  checkImageValidity(imageUrl: string): boolean {
    if (!imageUrl) return false;

    // 檢查是否為有效的 base64 圖片數據
    if (imageUrl.startsWith('data:image')) {
      try {
        // 確保 base64 字符串格式正確
        const base64Data = imageUrl.split(',')[1];
        atob(base64Data);
        return true;
      } catch (e) {
        console.error('Invalid base64 image data:', e);
        return false;
      }
    }
    return false;
  }

  removeSelectedImage(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    // 如果是在編輯模式下，也清除原有圖片
    if (this.editingIndex >= 0) {
      const currentProduct = this.products[this.editingIndex];
      currentProduct.picture = null;
    }
  }

  goBack(): void {
    this.location.back();
  }

}