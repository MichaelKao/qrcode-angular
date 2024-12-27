import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
  
  constructor(private fb: FormBuilder, private location: Location) {
    this.storeForm = this.fb.group({
      storeName: ['', Validators.required],
      description: [''],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      postCode: ['', Validators.required],
      city: ['', Validators.required],
      district: ['', Validators.required],
      streetAddress: ['', Validators.required],
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

    // 確保監聽所有 `isOpen` 欄位的變化
  this.businessHourControls.forEach(control => {
    const group = control as FormGroup;
    group.get('isOpen')?.valueChanges.subscribe(isOpen => {
      console.log("isOpen", isOpen);
      if (!isOpen) {
        group.get('openTime')?.reset({ value: null, disabled: true });
        group.get('closeTime')?.reset({ value: null, disabled: true });
      } else {
        group.get('openTime')?.enable();
        group.get('closeTime')?.enable();
      }
    });
  });
  }

  loadStoreData() {

    if (typeof window !== 'undefined') {

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const storeData = userData?.userStoreVo;
      if (storeData) {
        this.storeForm.patchValue({
          storeName: storeData.storeName,
          description: storeData.description,
          phone: storeData.phone,
          email: storeData.email,
          postCode: storeData.postCode,
          city: storeData.city,
          district: storeData.district,
          streetAddress: storeData.streetAddress,
          seats: storeData.seats
        });
  
        // 設置營業時間
        const hoursArray = this.storeForm.get('businessHoursList') as FormArray;
        // 清空現有的營業時間
        while (hoursArray.length) {
          hoursArray.removeAt(0);
        }
        // 添加新的營業時間
        console.log("loadStoreData--------->");
       storeData.businessHoursList.forEach((hour: BusinessHour) => {
          hoursArray.push(this.fb.group({
            seq: [{value: hour.seq, disabled: !this.isEditing}],
            week: [{value: hour.week, disabled: !this.isEditing}],
            isOpen: [{value: hour.isOpen, disabled: !this.isEditing}],
            openTime: [{value: hour.openTime, disabled: !this.isEditing}],
            closeTime: [{value: hour.closeTime, disabled: !this.isEditing}]
          }));
          
        }); 
        
      }

    }

  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    console.log("isEditing ===>", this.isEditing);
    const hoursArray = this.storeForm.get('businessHoursList') as FormArray;
    
    hoursArray.controls.forEach(control => {
      // const isOpenControl = control.get('isOpen');
      if(this.isEditing){
        control.get('isOpen')?.enable();
      }
      if (control.value.isOpen && this.isEditing) {
        control.get('openTime')?.enable();
        control.get('closeTime')?.enable();
      } else {
        control.get('openTime')?.disable();
        control.get('closeTime')?.disable();
      }
    });

    if (!this.isEditing) {
      this.loadStoreData();
    }
  }

  onSubmit() {
    if (this.storeForm.valid) {
      console.log(this.storeForm.value);
      // TODO: 實作更新資料的 API 呼叫
    }
  }

  goBack() {
    this.location.back();
  }
  
}