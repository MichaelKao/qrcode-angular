import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { LocationService } from '../../../services/location.service';
import { ApiService } from '../../../services/api.service';

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
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true, 
  imports: [
    CommonModule,
    ReactiveFormsModule,    
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    HttpClientModule
  ],
})

export class DashboardComponent implements OnInit {

  storeForm!: FormGroup;  
  businessHoursForm!: FormArray;
  selectedFileName: string | null = null;
  
  cities: City[] = [];
  districts: District[] = [];
  selectedDistricts: District[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar, private router: Router, private location: Location, private locationService: LocationService, private apiService: ApiService) {
    this.initForm();  
  }

  private initForm() {

    this.businessHoursForm = this.fb.array(this.initializeBusinessHours());

    this.storeForm = this.fb.group({
      storeName: ['', Validators.required],
      description: [''],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      city: ['', Validators.required],
      district: ['', Validators.required],
      postCode: [{value: '', disabled: true}],
      streetAddress: ['', Validators.required],
      seats: [0, [Validators.required, Validators.min(0)]],
      businessHours: this.businessHoursForm,
      logo: [null]
    });
  }

  ngOnInit() {
  
    this.storeForm.get('city')?.valueChanges.subscribe(cityId => {
      this.onCityChange(cityId);
    });

    this.storeForm.get('district')?.valueChanges.subscribe(districtId => {
      this.onDistrictChange(districtId);
    });

    this.initializeBusinessHours();

    this.cities = this.locationService.getCities();
    this.districts = this.locationService.getDistricts();
  }

  onLogoSelected(event: any): void {

    const inputElement = event.target as HTMLInputElement;
  
    if (inputElement && inputElement.files) {
      const file = inputElement.files[0];
      if (file) {
        this.selectedFileName = file.name; 
        this.storeForm.get('logo')?.setValue(file); 
      } else {
        this.selectedFileName = null; 
      }
    } else {
      this.selectedFileName = null; 
    }
  }

  private initializeBusinessHours() {
    const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
    return days.map(day => {
      const group = this.fb.group({
        week: [day],
        isOpen: [true],
        openTime: ['09:00'],
        closeTime: ['22:00']
      });
  
      // 設定監聽器
      group.get('isOpen')?.valueChanges.subscribe(isOpen => {
        if (!isOpen) {
          group.get('openTime')?.reset();
          group.get('closeTime')?.reset();
          group.get('openTime')?.disable();
          group.get('closeTime')?.disable();
        } else {
          group.get('openTime')?.enable();
          group.get('closeTime')?.enable();
          group.get('openTime')?.setValue('09:00');
          group.get('closeTime')?.setValue('22:00');
        }
      });
  
      return group;
    });
  }

  get businessHours() {
    return this.storeForm.get('businessHours') as FormArray;
  }

  getBusinessHourFormGroup(index: number) {
    return this.businessHours.at(index) as FormGroup;
  }

  onCityChange(cityId: number) {
    // 根據選擇的城市更新區域選項
    this.selectedDistricts = this.districts.filter(d => d.cityId === cityId);
    // 清空區域的選擇
    this.storeForm.get('district')?.setValue('');
    // 更新郵遞區號，根據選擇的城市設定
    this.updatePostCode();
  }

  onDistrictChange(district: number) {
    // 當區域選擇改變時，更新郵遞區號
    this.updatePostCode();
  }

  updatePostCode() {
    const cityId = this.storeForm.get('city')?.value;
    const districtId = this.storeForm.get('district')?.value;
    
    if (cityId) {
      const city = this.cities.find(c => c.id === cityId);
      
      // 根據選擇的城市和區域來設置郵遞區號
      if (city) {
        if (districtId) {
          const district = this.districts.find(d => d.id === districtId);
          if (district) {
            this.storeForm.get('postCode')?.setValue(district.postCode);  // 根據區域設置郵遞區號
          }
        } else {
          this.storeForm.get('postCode')?.setValue(city.postCode);  // 如果沒有選擇區域，則設置城市郵遞區號
        }
      }
    }
  }

  onSubmit() {
    if (this.storeForm.valid) {

      const formData = new FormData();
      const userData = JSON.parse(localStorage.getItem('user') ?? '{}');
      
      // 直接指定要傳送的欄位
      formData.append('storeSeq', userData.seq);
      formData.append('storeName', this.storeForm.get('storeName')?.value);
      formData.append('description', this.storeForm.get('description')?.value);
      formData.append('phone', this.storeForm.get('phone')?.value);
      formData.append('email', this.storeForm.get('email')?.value);
      formData.append('streetAddress', this.storeForm.get('streetAddress')?.value);
      formData.append('seats', this.storeForm.get('seats')?.value);
      formData.append('postCode', this.storeForm.get('postCode')?.value);
      
      // 處理城市和區域的中文名稱
      const cityId = this.storeForm.get('city')?.value;
      const districtId = this.storeForm.get('district')?.value;
      formData.append('city', this.cities.find(c => c.id === cityId)?.name || '');
      formData.append('district', this.districts.find(d => d.id === districtId)?.name || '');
      
      // 處理營業時間
      formData.append('businessHours', JSON.stringify(this.businessHoursForm.value));
      
      // 處理 logo 檔案
      const logo = this.storeForm.get('logo')?.value;
      if (logo instanceof File) {
        formData.append('logo', logo, logo.name);
      }

      this.apiService.createStore(formData).subscribe({
        next: (response) => {
          if (response.code === 200) {
            localStorage.setItem('user', JSON.stringify(response.data));
            this.router.navigate(['/']);
          } else {
            this.snackBar.open(response.code + ':' + response.message, '關閉', { duration: 3000 });
          }       
        },
        error: () => {
          this.snackBar.open('創建商店時出現錯誤', '關閉', { duration: 3000 });
        }
      });

    }
  }

  goBack() {
    this.location.back();
  }

}