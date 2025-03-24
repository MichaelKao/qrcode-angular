import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationService } from '../../../services/location.service';
import { ApiService } from '../../../services/api.service';

interface BusinessHour {
  seq: number;
  storeSeq: number;
  isOpen: boolean;
  week: string;
  openTime: string;
  closeTime: string;
}

interface City {
  id: number;
  name: string;
  postCode: string;
}

interface District {
  id: number;
  cityId: number;
  name: string;
  postCode: string;
}

@Component({
  selector: 'app-menu-management',
  templateUrl: './menu-management.component.html',
  styleUrl: './menu-management.component.css',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
  ]
})
export class MenuManagementComponent implements OnInit {
  storeForm: FormGroup;
  isEditing = false;
  cities: City[] = [];
  districts: District[] = [];
  filteredDistricts: District[] = [];

  constructor(private fb: FormBuilder, private location: Location, private http: HttpClient, private router: Router, private snackBar: MatSnackBar, private locationService: LocationService, private apiService: ApiService) {
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
      businessHoursList: this.fb.array([]),
      logo: [null]
    });
  }

  // 添加 getter 方法來存取 businessHoursList
  get businessHourControls() {
    const businessHoursList = this.storeForm.get('businessHoursList');
    return businessHoursList ? (businessHoursList as FormArray).controls : [];
  }

  ngOnInit() {
    this.loadStoreData();

    const cityControl = this.storeForm.get('city');
    const districtControl = this.storeForm.get('district');

    if (this.isEditing) {
      cityControl?.enable();
      districtControl?.enable();
    } else {
      cityControl?.disable();
      districtControl?.disable();
    }
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
          group.get('openTime')?.setValue('09:00');
          group.get('closeTime')?.setValue('22:00');
        }
      });
    });
  }

  loadStoreData() {

    this.cities = this.locationService.getCities();
    this.districts = this.locationService.getDistricts();

    if (typeof window !== 'undefined') {

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const storeData = userData?.userStoreVo;
      if (storeData) {

        const cityFound = this.cities.find(c => c.name == storeData.city);
        const cityId = cityFound?.id;

        if (cityId) {
          this.filteredDistricts = this.districts.filter(d => d.cityId == cityId);
          const districtFound = this.filteredDistricts.find(d => d.name == storeData.district);
          const districtId = districtFound?.id;

          this.storeForm.patchValue({
            storeName: storeData.storeName,
            description: storeData.description,
            phone: storeData.phone,
            email: storeData.email,
            postCode: storeData.postCode,
            city: cityId,
            district: districtId,
            streetAddress: storeData.streetAddress,
            seats: storeData.seats
          });
        }

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
            seq: [{ value: hour.seq, disabled: !this.isEditing }],
            week: [hour.week],
            isOpen: [{ value: hour.isOpen, disabled: !this.isEditing }],
            openTime: [{ value: hour.openTime, disabled: !this.isEditing }],
            closeTime: [{ value: hour.closeTime, disabled: !this.isEditing }]
          }));

        });

      }

    }

  }

  onCityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.filteredDistricts = this.districts.filter(d => d.cityId === Number(target.value));
    this.storeForm.get('district')?.setValue('');
    this.updatePostCode();
  }

  onDistrictChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.updatePostCode();
  }

  updatePostCode() {
    const cityId = this.storeForm.get('city')?.value;
    const districtId = this.storeForm.get('district')?.value;

    if (cityId && districtId) {
      const district = this.districts.find(d => d.id === Number(districtId));
      if (district) {
        this.storeForm.get('postCode')?.setValue(district.postCode);
      }
    } else if (cityId) {
      const city = this.cities.find(c => c.id === Number(cityId));
      if (city) {
        this.storeForm.get('postCode')?.setValue(city.postCode);
      }
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;

    const cityControl = this.storeForm.get('city');
    const districtControl = this.storeForm.get('district');

    if (this.isEditing) {
      cityControl?.enable();
      districtControl?.enable();
    } else {
      cityControl?.disable();
      districtControl?.disable();
    }

    const hoursArray = this.storeForm.get('businessHoursList') as FormArray;

    hoursArray.controls.forEach(control => {
      // const isOpenControl = control.get('isOpen');
      if (this.isEditing) {
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

      const formData = new FormData();
      const userData = JSON.parse(localStorage.getItem('user') ?? '{}');
      const formValue = this.storeForm.value;

      // 直接指定要傳送的欄位
      formData.append('seq', userData.userStoreVo.seq);
      formData.append('storeSeq', userData.seq);
      formData.append('storeName', this.storeForm.get('storeName')?.value);
      formData.append('description', this.storeForm.get('description')?.value);
      formData.append('phone', this.storeForm.get('phone')?.value);
      formData.append('email', this.storeForm.get('email')?.value);
      formData.append('streetAddress', this.storeForm.get('streetAddress')?.value);
      formData.append('seats', this.storeForm.get('seats')?.value);
      formData.append('postCode', this.storeForm.get('postCode')?.value);

      // 處理城市和區域的中文名稱   
      const selectedCityId = Number(this.storeForm.get('city')?.value);
      const selectedDistrictId = Number(this.storeForm.get('district')?.value);

      const cityName = this.cities.find(c => c.id === selectedCityId)?.name ?? '';
      const districtName = this.districts.find(d => d.id === selectedDistrictId)?.name ?? '';

      formData.append('city', cityName);
      formData.append('district', districtName);

      // 處理營業時間
      const businessHours = formValue.businessHoursList.map((hour: any) => ({
        week: hour.week,
        isOpen: hour.isOpen,
        openTime: hour.isOpen ? hour.openTime : null,
        closeTime: hour.isOpen ? hour.closeTime : null
      }));
      formData.append('businessHours', JSON.stringify(businessHours));

      // 處理 logo 檔案
      const logo = this.storeForm.get('logo')?.value;
      if (logo instanceof File) {
        formData.append('logo', logo, logo.name);
      }

      this.apiService.updateStore(formData).subscribe({
        next: (response) => {

          if (response.code === 200) {
            localStorage.setItem('user', JSON.stringify(response.data));
            this.snackBar.open('商店資訊更新成功', '關閉', { duration: 3000 });
            this.router.navigate(['/']);
          } else {
            this.snackBar.open(response.code + ':' + response.message, '關閉', { duration: 3000 });
          }

        },
        error: (error) => {
          console.error('Update store error:', error);
          this.snackBar.open('更新商店時出現錯誤', '關閉', { duration: 3000 });
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.storeForm.controls).forEach(key => {
        const control = this.storeForm.get(key);
        control?.markAsTouched();
      });
      this.snackBar.open('請檢查表單資料是否完整', '關閉', { duration: 3000 });
    }
  }

  goBack() {
    this.location.back();
  }

}