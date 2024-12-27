import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

interface BusinessHour {
  seq: number;
  storeSeq: number;
  isOpen: boolean;
  week: string;
  openTime: string;
  closeTime: string;
}

@Component({
  selector: 'app-menu-management',
  templateUrl: './menu-management.component.html',
  styleUrl: './menu-management.component.css',
  standalone: true, 
  imports: [
    CommonModule,  
    ReactiveFormsModule 
  ]
})
export class MenuManagementComponent implements OnInit {
  storeForm: FormGroup;
  isEditing = false;
  
  constructor(private fb: FormBuilder) {
    this.storeForm = this.fb.group({
      storeName: ['', Validators.required],
      description: [''],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      seats: [0],
      businessHoursList: this.fb.array([])
    });
  }

  // 添加 getter 方法來存取 businessHoursList
  get businessHourControls() {
    const businessHoursList = this.storeForm.get('businessHoursList');
    return businessHoursList ? (businessHoursList as FormArray).controls : [];
  }

  ngOnInit() {
    this.loadStoreData();
  }

  loadStoreData() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const storeData = userData?.userStoreVo;
    
    if (storeData) {
      this.storeForm.patchValue({
        storeName: storeData.storeName,
        description: storeData.description,
        phone: storeData.phone,
        email: storeData.email,
        address: storeData.address,
        seats: storeData.seats
      });

      // 設置營業時間
      const hoursArray = this.storeForm.get('businessHoursList') as FormArray;
      // 清空現有的營業時間
      while (hoursArray.length) {
        hoursArray.removeAt(0);
      }
      // 添加新的營業時間
      storeData.businessHoursList.forEach((hour: BusinessHour) => {
        hoursArray.push(this.fb.group({
          seq: [hour.seq],
          week: [hour.week],
          isOpen: [hour.isOpen],
          openTime: [hour.openTime],
          closeTime: [hour.closeTime]
        }));
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // 取消編輯時重新載入資料
      this.loadStoreData();
    }
  }

  onSubmit() {
    if (this.storeForm.valid) {
      console.log(this.storeForm.value);
      // TODO: 實作更新資料的 API 呼叫
    }
  }
}