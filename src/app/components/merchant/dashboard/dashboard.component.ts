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

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar, private router: Router, private location: Location) {
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
    this.initializeCityData();
  
    this.storeForm.get('city')?.valueChanges.subscribe(cityId => {
      this.onCityChange(cityId);
    });

    this.storeForm.get('district')?.valueChanges.subscribe(districtId => {
      this.onDistrictChange(districtId);
    });

    this.initializeBusinessHours();

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

  private initializeBusinessHours2() {
    const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
    return days.map(day => {
      return this.fb.group({
        week: [day],
        isOpen: [true],
        openTime: ['09:00'],
        closeTime: ['22:00']
      });
    });
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

  private initializeCityData() {
    this.cities = [
      { id: 1, name: '台北市', postCode: '100' },
      { id: 2, name: '新北市', postCode: '220' },
      { id: 3, name: '基隆市', postCode: '200' },
      { id: 4, name: '桃園市', postCode: '320' },
      { id: 5, name: '新竹市', postCode: '300' },
      { id: 6, name: '新竹縣', postCode: '302' },
      { id: 7, name: '苗栗縣', postCode: '360' },
      { id: 8, name: '台中市', postCode: '400' },
      { id: 9, name: '彰化縣', postCode: '500' },
      { id: 10, name: '南投縣', postCode: '540' },
      { id: 11, name: '雲林縣', postCode: '640' },
      { id: 12, name: '嘉義市', postCode: '600' },
      { id: 13, name: '嘉義縣', postCode: '602' },
      { id: 14, name: '台南市', postCode: '700' },
      { id: 15, name: '高雄市', postCode: '800' },
      { id: 16, name: '屏東縣', postCode: '900' },
      { id: 17, name: '宜蘭縣', postCode: '260' },
      { id: 18, name: '花蓮縣', postCode: '970' },
      { id: 19, name: '台東縣', postCode: '950' },
      { id: 20, name: '澎湖縣', postCode: '880' },
      { id: 21, name: '金門縣', postCode: '893' },
      { id: 22, name: '連江縣', postCode: '209' }
    ];
  
    this.districts = [
      // 台北市
      { id: 1, cityId: 1, name: '中正區', postCode: '100' },
      { id: 2, cityId: 1, name: '大同區', postCode: '103' },
      { id: 3, cityId: 1, name: '中山區', postCode: '104' },
      { id: 4, cityId: 1, name: '松山區', postCode: '105' },
      { id: 5, cityId: 1, name: '大安區', postCode: '106' },
      { id: 6, cityId: 1, name: '萬華區', postCode: '108' },
      { id: 7, cityId: 1, name: '信義區', postCode: '110' },
      { id: 8, cityId: 1, name: '士林區', postCode: '111' },
      { id: 9, cityId: 1, name: '北投區', postCode: '112' },
      { id: 10, cityId: 1, name: '內湖區', postCode: '114' },
      { id: 11, cityId: 1, name: '南港區', postCode: '115' },
      { id: 12, cityId: 1, name: '文山區', postCode: '116' },
      // 新北市
      { id: 13, cityId: 2, name: '板橋區', postCode: '220' },
      { id: 14, cityId: 2, name: '新莊區', postCode: '242' },
      { id: 15, cityId: 2, name: '中和區', postCode: '235' },
      { id: 16, cityId: 2, name: '永和區', postCode: '234' },
      { id: 17, cityId: 2, name: '土城區', postCode: '236' },
      { id: 18, cityId: 2, name: '樹林區', postCode: '238' },
      { id: 19, cityId: 2, name: '三峽區', postCode: '237' },
      { id: 20, cityId: 2, name: '鶯歌區', postCode: '239' },
      { id: 21, cityId: 2, name: '三重區', postCode: '241' },
      { id: 22, cityId: 2, name: '蘆洲區', postCode: '247' },
      { id: 23, cityId: 2, name: '五股區', postCode: '248' },
      { id: 24, cityId: 2, name: '泰山區', postCode: '243' },
      { id: 25, cityId: 2, name: '林口區', postCode: '244' },
      { id: 26, cityId: 2, name: '八里區', postCode: '249' },
      { id: 27, cityId: 2, name: '淡水區', postCode: '251' },
      { id: 28, cityId: 2, name: '三芝區', postCode: '252' },
      { id: 29, cityId: 2, name: '石門區', postCode: '253' },
      { id: 30, cityId: 2, name: '金山區', postCode: '208' },
      { id: 31, cityId: 2, name: '萬里區', postCode: '207' },
      { id: 32, cityId: 2, name: '汐止區', postCode: '221' },
      { id: 33, cityId: 2, name: '瑞芳區', postCode: '224' },
      { id: 34, cityId: 2, name: '貢寮區', postCode: '228' },
      { id: 35, cityId: 2, name: '平溪區', postCode: '226' },
      { id: 36, cityId: 2, name: '雙溪區', postCode: '227' },
      { id: 37, cityId: 2, name: '新店區', postCode: '231' },
      { id: 38, cityId: 2, name: '深坑區', postCode: '222' },
      { id: 39, cityId: 2, name: '石碇區', postCode: '223' },
      { id: 40, cityId: 2, name: '坪林區', postCode: '232' },
      { id: 41, cityId: 2, name: '烏來區', postCode: '233' },
      // 基隆市
      { id: 42, cityId: 3, name: '仁愛區', postCode: '200' },
      { id: 43, cityId: 3, name: '信義區', postCode: '201' },
      { id: 44, cityId: 3, name: '中正區', postCode: '202' },
      { id: 45, cityId: 3, name: '中山區', postCode: '203' },
      { id: 46, cityId: 3, name: '安樂區', postCode: '204' },
      { id: 47, cityId: 3, name: '暖暖區', postCode: '205' },
      { id: 48, cityId: 3, name: '七堵區', postCode: '206' },
      // 桃園市
      { id: 49, cityId: 4, name: '桃園區', postCode: '330' },
      { id: 50, cityId: 4, name: '中壢區', postCode: '320' },
      { id: 51, cityId: 4, name: '平鎮區', postCode: '324' },
      { id: 52, cityId: 4, name: '八德區', postCode: '334' },
      { id: 53, cityId: 4, name: '楊梅區', postCode: '326' },
      { id: 54, cityId: 4, name: '蘆竹區', postCode: '338' },
      { id: 55, cityId: 4, name: '大溪區', postCode: '335' },
      { id: 56, cityId: 4, name: '龍潭區', postCode: '325' },
      { id: 57, cityId: 4, name: '龜山區', postCode: '333' },
      { id: 58, cityId: 4, name: '大園區', postCode: '337' },
      { id: 59, cityId: 4, name: '觀音區', postCode: '328' },
      { id: 60, cityId: 4, name: '新屋區', postCode: '327' },
      { id: 61, cityId: 4, name: '復興區', postCode: '336' },
      // 新竹市
      { id: 62, cityId: 5, name: '東區', postCode: '300' },
      { id: 63, cityId: 5, name: '北區', postCode: '300' },
      { id: 64, cityId: 5, name: '香山區', postCode: '300' },
      // 新竹縣
      { id: 65, cityId: 6, name: '竹北市', postCode: '302' },
      { id: 66, cityId: 6, name: '竹東鎮', postCode: '310' },
      { id: 67, cityId: 6, name: '新埔鎮', postCode: '305' },
      { id: 68, cityId: 6, name: '關西鎮', postCode: '306' },
      { id: 69, cityId: 6, name: '湖口鄉', postCode: '303' },
      { id: 70, cityId: 6, name: '新豐鄉', postCode: '304' },
      { id: 71, cityId: 6, name: '芎林鄉', postCode: '307' },
      { id: 72, cityId: 6, name: '橫山鄉', postCode: '312' },
      { id: 73, cityId: 6, name: '北埔鄉', postCode: '314' },
      { id: 74, cityId: 6, name: '寶山鄉', postCode: '308' },
      { id: 75, cityId: 6, name: '峨眉鄉', postCode: '315' },
      { id: 76, cityId: 6, name: '尖石鄉', postCode: '313' },
      { id: 77, cityId: 6, name: '五峰鄉', postCode: '311' },
      // 苗栗縣
      { id: 78, cityId: 7, name: '苗栗市', postCode: '360' },
      { id: 79, cityId: 7, name: '頭份市', postCode: '351' },
      { id: 80, cityId: 7, name: '竹南鎮', postCode: '350' },
      { id: 81, cityId: 7, name: '後龍鎮', postCode: '356' },
      { id: 82, cityId: 7, name: '通霄鎮', postCode: '357' },
      { id: 83, cityId: 7, name: '苑裡鎮', postCode: '358' },
      { id: 84, cityId: 7, name: '卓蘭鎮', postCode: '369' },
      { id: 85, cityId: 7, name: '造橋鄉', postCode: '361' },
      { id: 86, cityId: 7, name: '西湖鄉', postCode: '368' },
      { id: 87, cityId: 7, name: '頭屋鄉', postCode: '362' },
      { id: 88, cityId: 7, name: '公館鄉', postCode: '363' },
      { id: 89, cityId: 7, name: '銅鑼鄉', postCode: '366' },
      { id: 90, cityId: 7, name: '三義鄉', postCode: '367' },
      { id: 91, cityId: 7, name: '大湖鄉', postCode: '364' },
      { id: 92, cityId: 7, name: '獅潭鄉', postCode: '354' },
      { id: 93, cityId: 7, name: '三灣鄉', postCode: '352' },
      { id: 94, cityId: 7, name: '南庄鄉', postCode: '353' },
      { id: 95, cityId: 7, name: '泰安鄉', postCode: '365' },
      // 台中市
      { id: 96, cityId: 8, name: '中區', postCode: '400' },
      { id: 97, cityId: 8, name: '東區', postCode: '401' },
      { id: 98, cityId: 8, name: '南區', postCode: '402' },
      { id: 99, cityId: 8, name: '西區', postCode: '403' },
      { id: 100, cityId: 8, name: '北區', postCode: '404' },
      { id: 101, cityId: 8, name: '北屯區', postCode: '406' },
      { id: 102, cityId: 8, name: '西屯區', postCode: '407' },
      { id: 103, cityId: 8, name: '南屯區', postCode: '408' },
      { id: 104, cityId: 8, name: '太平區', postCode: '411' },
      { id: 105, cityId: 8, name: '大里區', postCode: '412' },
      { id: 106, cityId: 8, name: '霧峰區', postCode: '413' },
      { id: 107, cityId: 8, name: '烏日區', postCode: '414' },
      { id: 108, cityId: 8, name: '豐原區', postCode: '420' },
      { id: 109, cityId: 8, name: '后里區', postCode: '421' },
      { id: 110, cityId: 8, name: '石岡區', postCode: '422' },
      { id: 111, cityId: 8, name: '東勢區', postCode: '423' },
      { id: 112, cityId: 8, name: '和平區', postCode: '424' },
      { id: 113, cityId: 8, name: '新社區', postCode: '426' },
      { id: 114, cityId: 8, name: '潭子區', postCode: '427' },
      { id: 115, cityId: 8, name: '大雅區', postCode: '428' },
      { id: 116, cityId: 8, name: '神岡區', postCode: '429' },
      { id: 117, cityId: 8, name: '大肚區', postCode: '432' },
      { id: 118, cityId: 8, name: '沙鹿區', postCode: '433' },
      { id: 119, cityId: 8, name: '龍井區', postCode: '434' },
      { id: 120, cityId: 8, name: '梧棲區', postCode: '435' },
      { id: 121, cityId: 8, name: '清水區', postCode: '436' },
      { id: 122, cityId: 8, name: '大甲區', postCode: '437' },
      { id: 123, cityId: 8, name: '外埔區', postCode: '438' },
      { id: 124, cityId: 8, name: '大安區', postCode: '439' },
      // 彰化縣
      { id: 125, cityId: 9, name: '彰化市', postCode: '500' },
      { id: 126, cityId: 9, name: '員林市', postCode: '510' },
      { id: 127, cityId: 9, name: '和美鎮', postCode: '508' },
      { id: 128, cityId: 9, name: '鹿港鎮', postCode: '505' },
      { id: 129, cityId: 9, name: '溪湖鎮', postCode: '514' },
      { id: 130, cityId: 9, name: '二林鎮', postCode: '526' },
      { id: 131, cityId: 9, name: '田中鎮', postCode: '520' },
      { id: 132, cityId: 9, name: '北斗鎮', postCode: '521' },
      { id: 133, cityId: 9, name: '花壇鄉', postCode: '503' },
      { id: 134, cityId: 9, name: '芬園鄉', postCode: '502' },
      { id: 135, cityId: 9, name: '大村鄉', postCode: '515' },
      { id: 136, cityId: 9, name: '永靖鄉', postCode: '512' },
      { id: 137, cityId: 9, name: '伸港鄉', postCode: '509' },
      { id: 138, cityId: 9, name: '線西鄉', postCode: '507' },
      { id: 139, cityId: 9, name: '福興鄉', postCode: '506' },
      { id: 140, cityId: 9, name: '秀水鄉', postCode: '504' },
      { id: 141, cityId: 9, name: '埔心鄉', postCode: '513' },
      { id: 142, cityId: 9, name: '埔鹽鄉', postCode: '516' },
      { id: 143, cityId: 9, name: '大城鄉', postCode: '527' },
      { id: 144, cityId: 9, name: '芳苑鄉', postCode: '528' },
      { id: 145, cityId: 9, name: '竹塘鄉', postCode: '525' },
      { id: 146, cityId: 9, name: '社頭鄉', postCode: '511' },
      { id: 147, cityId: 9, name: '二水鄉', postCode: '530' },
      { id: 148, cityId: 9, name: '田尾鄉', postCode: '522' },
      { id: 149, cityId: 9, name: '埤頭鄉', postCode: '523' },
      { id: 150, cityId: 9, name: '溪州鄉', postCode: '524' },
      // 南投縣
      { id: 151, cityId: 10, name: '南投市', postCode: '540' },
      { id: 152, cityId: 10, name: '草屯鎮', postCode: '542' },
      { id: 153, cityId: 10, name: '埔里鎮', postCode: '545' },
      { id: 154, cityId: 10, name: '竹山鎮', postCode: '557' },
      { id: 155, cityId: 10, name: '集集鎮', postCode: '552' },
      { id: 156, cityId: 10, name: '名間鄉', postCode: '551' },
      { id: 157, cityId: 10, name: '鹿谷鄉', postCode: '558' },
      { id: 158, cityId: 10, name: '中寮鄉', postCode: '541' },
      { id: 159, cityId: 10, name: '魚池鄉', postCode: '555' },
      { id: 160, cityId: 10, name: '國姓鄉', postCode: '544' },
      { id: 161, cityId: 10, name: '水里鄉', postCode: '553' },
      { id: 162, cityId: 10, name: '信義鄉', postCode: '556' },
      { id: 163, cityId: 10, name: '仁愛鄉', postCode: '546' },
      // 雲林縣
      { id: 1, cityId: 11, name: '斗六市', postCode: '640' },
      { id: 2, cityId: 11, name: '虎尾鎮', postCode: '632' },
      { id: 3, cityId: 11, name: '土庫鎮', postCode: '633' },
      { id: 4, cityId: 11, name: '麥寮鄉', postCode: '634' },
      { id: 5, cityId: 11, name: '東勢鄉', postCode: '635' },
      { id: 6, cityId: 11, name: '崙背鄉', postCode: '636' },
      { id: 7, cityId: 11, name: '林內鄉', postCode: '637' },
      { id: 8, cityId: 11, name: '西螺鎮', postCode: '638' },
      { id: 9, cityId: 11, name: '二崙鄉', postCode: '639' },
      { id: 10, cityId: 11, name: '大埤鄉', postCode: '641' },
      { id: 11, cityId: 11, name: '莿桐鄉', postCode: '642' },
      { id: 12, cityId: 11, name: '林圮鄉', postCode: '643' },
      { id: 13, cityId: 11, name: '北港鎮', postCode: '644' },
      // 嘉義市
      { id: 1, cityId: 12, name: '東區', postCode: '600' },
      { id: 2, cityId: 12, name: '西區', postCode: '602' },
      // 嘉義縣
      { id: 1, cityId: 13, name: '太保市', postCode: '612' },
      { id: 2, cityId: 13, name: '朴子市', postCode: '613' },
      { id: 3, cityId: 13, name: '布袋鎮', postCode: '614' },
      { id: 4, cityId: 13, name: '大林鎮', postCode: '615' },
      { id: 5, cityId: 13, name: '民雄鄉', postCode: '616' },
      { id: 6, cityId: 13, name: '溪口鄉', postCode: '617' },
      { id: 7, cityId: 13, name: '新港鄉', postCode: '618' },
      { id: 8, cityId: 13, name: '六腳鄉', postCode: '619' },
      { id: 9, cityId: 13, name: '東石鄉', postCode: '620' },
      { id: 10, cityId: 13, name: '義竹鄉', postCode: '621' },
      { id: 11, cityId: 13, name: '鹿草鄉', postCode: '622' },
      { id: 12, cityId: 13, name: '大埔鄉', postCode: '623' },
      { id: 13, cityId: 13, name: '水上鄉', postCode: '624' },
      { id: 14, cityId: 13, name: '中埔鄉', postCode: '625' },
      { id: 15, cityId: 13, name: '竹崎鄉', postCode: '626' },
      { id: 16, cityId: 13, name: '梅山鄉', postCode: '627' },
      { id: 17, cityId: 13, name: '番路鄉', postCode: '628' },
      { id: 18, cityId: 13, name: '大坪鄉', postCode: '629' },
      // 台南市
      { id: 1, cityId: 14, name: '中西區', postCode: '700' },
      { id: 2, cityId: 14, name: '東區', postCode: '701' },
      { id: 3, cityId: 14, name: '南區', postCode: '702' },
      { id: 4, cityId: 14, name: '北區', postCode: '704' },
      { id: 5, cityId: 14, name: '安平區', postCode: '708' },
      { id: 6, cityId: 14, name: '安南區', postCode: '709' },
      { id: 7, cityId: 14, name: '永康區', postCode: '710' },
      { id: 8, cityId: 14, name: '歸仁區', postCode: '711' },
      { id: 9, cityId: 14, name: '新化區', postCode: '712' },
      { id: 10, cityId: 14, name: '左鎮區', postCode: '713' },
      { id: 11, cityId: 14, name: '玉井區', postCode: '714' },
      { id: 12, cityId: 14, name: '楠西區', postCode: '715' },
      { id: 13, cityId: 14, name: '南化區', postCode: '716' },
      { id: 14, cityId: 14, name: '仁德區', postCode: '717' },
      { id: 15, cityId: 14, name: '關廟區', postCode: '718' },
      { id: 16, cityId: 14, name: '龍崎區', postCode: '719' },
      { id: 17, cityId: 14, name: '官田區', postCode: '720' },
      { id: 18, cityId: 14, name: '麻豆區', postCode: '721' },
      { id: 19, cityId: 14, name: '佳里區', postCode: '722' },
      { id: 20, cityId: 14, name: '西港區', postCode: '723' },
      { id: 21, cityId: 14, name: '七股區', postCode: '724' },
      { id: 22, cityId: 14, name: '將軍區', postCode: '725' },
      { id: 23, cityId: 14, name: '學甲區', postCode: '726' },
      { id: 24, cityId: 14, name: '北門區', postCode: '727' },
      { id: 25, cityId: 14, name: '新營區', postCode: '730' },
      { id: 26, cityId: 14, name: '後壁區', postCode: '731' },
      { id: 27, cityId: 14, name: '白河區', postCode: '732' },
      { id: 28, cityId: 14, name: '東山區', postCode: '733' },
      { id: 29, cityId: 14, name: '六甲區', postCode: '734' },
      { id: 30, cityId: 14, name: '下營區', postCode: '735' },
      { id: 31, cityId: 14, name: '柳營區', postCode: '736' },
      { id: 32, cityId: 14, name: '鹽水區', postCode: '737' },
      { id: 33, cityId: 14, name: '善化區', postCode: '741' },
      { id: 34, cityId: 14, name: '大內區', postCode: '742' },
      { id: 35, cityId: 14, name: '山上區', postCode: '743' },
      { id: 36, cityId: 14, name: '新市區', postCode: '744' },
      { id: 37, cityId: 14, name: '安定區', postCode: '745' },
      // 高雄市
      { id: 1, cityId: 15, name: '楠梓區', postCode: '811' },
      { id: 2, cityId: 15, name: '左營區', postCode: '813' },
      { id: 3, cityId: 15, name: '鼓山區', postCode: '804' },
      { id: 4, cityId: 15, name: '三民區', postCode: '807' },
      { id: 5, cityId: 15, name: '苓雅區', postCode: '802' },
      { id: 6, cityId: 15, name: '前金區', postCode: '801' },
      { id: 7, cityId: 15, name: '前鎮區', postCode: '806' },
      { id: 8, cityId: 15, name: '旗津區', postCode: '805' },
      { id: 9, cityId: 15, name: '小港區', postCode: '812' },
      { id: 10, cityId: 15, name: '鳳山區', postCode: '830' },
      { id: 11, cityId: 15, name: '林園區', postCode: '832' },
      { id: 12, cityId: 15, name: '大寮區', postCode: '831' },
      { id: 13, cityId: 15, name: '大樹區', postCode: '840' },
      { id: 14, cityId: 15, name: '大社區', postCode: '815' },
      { id: 15, cityId: 15, name: '仁武區', postCode: '814' },
      { id: 16, cityId: 15, name: '鳥松區', postCode: '833' },
      { id: 17, cityId: 15, name: '岡山區', postCode: '820' },
      { id: 18, cityId: 15, name: '橋頭區', postCode: '825' },
      { id: 19, cityId: 15, name: '燕巢區', postCode: '824' },
      { id: 20, cityId: 15, name: '田寮區', postCode: '823' },
      { id: 21, cityId: 15, name: '阿蓮區', postCode: '822' },
      { id: 22, cityId: 15, name: '路竹區', postCode: '821' },
      { id: 23, cityId: 15, name: '湖內區', postCode: '829' },
      { id: 24, cityId: 15, name: '茄萣區', postCode: '852' },
      { id: 25, cityId: 15, name: '永安區', postCode: '828' },
      { id: 26, cityId: 15, name: '彌陀區', postCode: '827' },
      { id: 27, cityId: 15, name: '梓官區', postCode: '826' },
      { id: 28, cityId: 15, name: '旗山區', postCode: '842' },
      { id: 29, cityId: 15, name: '美濃區', postCode: '843' },
      { id: 30, cityId: 15, name: '六龜區', postCode: '844' },
      { id: 31, cityId: 15, name: '甲仙區', postCode: '845' },
      { id: 32, cityId: 15, name: '杉林區', postCode: '846' },
      { id: 33, cityId: 15, name: '內門區', postCode: '847' },
      { id: 34, cityId: 15, name: '茂林區', postCode: '851' },
      { id: 35, cityId: 15, name: '桃源區', postCode: '848' },
      { id: 36, cityId: 15, name: '那瑪夏區', postCode: '849' },
      // 屏東縣
      { id: 1, cityId: 16, name: '屏東市', postCode: '900' },
      { id: 2, cityId: 16, name: '三地門鄉', postCode: '901' },
      { id: 3, cityId: 16, name: '霧臺鄉', postCode: '902' },
      { id: 4, cityId: 16, name: '瑪家鄉', postCode: '903' },
      { id: 5, cityId: 16, name: '九如鄉', postCode: '904' },
      { id: 6, cityId: 16, name: '里港鄉', postCode: '905' },
      { id: 7, cityId: 16, name: '高樹鄉', postCode: '906' },
      { id: 8, cityId: 16, name: '鹽埔鄉', postCode: '907' },
      { id: 9, cityId: 16, name: '長治鄉', postCode: '908' },
      { id: 10, cityId: 16, name: '麟洛鄉', postCode: '909' },
      { id: 11, cityId: 16, name: '竹田鄉', postCode: '911' },
      { id: 12, cityId: 16, name: '內埔鄉', postCode: '912' },
      { id: 13, cityId: 16, name: '萬丹鄉', postCode: '913' },
      { id: 14, cityId: 16, name: '潮州鎮', postCode: '920' },
      { id: 15, cityId: 16, name: '泰武鄉', postCode: '921' },
      { id: 16, cityId: 16, name: '來義鄉', postCode: '922' },
      { id: 17, cityId: 16, name: '萬巒鄉', postCode: '923' },
      { id: 18, cityId: 16, name: '崁頂鄉', postCode: '924' },
      { id: 19, cityId: 16, name: '新埤鄉', postCode: '925' },
      { id: 20, cityId: 16, name: '南州鄉', postCode: '926' },
      { id: 21, cityId: 16, name: '林邊鄉', postCode: '927' },
      { id: 22, cityId: 16, name: '東港鎮', postCode: '928' },
      { id: 23, cityId: 16, name: '琉球鄉', postCode: '929' },
      { id: 24, cityId: 16, name: '佳冬鄉', postCode: '931' },
      { id: 25, cityId: 16, name: '新園鄉', postCode: '932' },
      { id: 26, cityId: 16, name: '枋寮鄉', postCode: '940' },
      { id: 27, cityId: 16, name: '枋山鄉', postCode: '941' },
      { id: 28, cityId: 16, name: '春日鄉', postCode: '942' },
      { id: 29, cityId: 16, name: '獅子鄉', postCode: '943' },
      { id: 30, cityId: 16, name: '車城鄉', postCode: '944' },
      { id: 31, cityId: 16, name: '牡丹鄉', postCode: '945' },
      { id: 32, cityId: 16, name: '恆春鎮', postCode: '946' },
      { id: 33, cityId: 16, name: '滿州鄉', postCode: '947' },
      // 宜蘭縣
      { id: 1, cityId: 17, name: '宜蘭市', postCode: '260' },
      { id: 2, cityId: 17, name: '頭城鎮', postCode: '261' },
      { id: 3, cityId: 17, name: '礁溪鄉', postCode: '262' },
      { id: 4, cityId: 17, name: '壯圍鄉', postCode: '263' },
      { id: 5, cityId: 17, name: '員山鄉', postCode: '264' },
      { id: 6, cityId: 17, name: '羅東鎮', postCode: '265' },
      { id: 7, cityId: 17, name: '三星鄉', postCode: '266' },
      { id: 8, cityId: 17, name: '大同鄉', postCode: '267' },
      { id: 9, cityId: 17, name: '五結鄉', postCode: '268' },
      { id: 10, cityId: 17, name: '冬山鄉', postCode: '269' },
      { id: 11, cityId: 17, name: '蘇澳鎮', postCode: '270' },
      { id: 12, cityId: 17, name: '南澳鄉', postCode: '272' },
      { id: 13, cityId: 17, name: '釣魚臺', postCode: '290' },
      // 花蓮縣
      { id: 1, cityId: 18, name: '花蓮市', postCode: '970' },
      { id: 2, cityId: 18, name: '新城鄉', postCode: '971' },
      { id: 3, cityId: 18, name: '吉安鄉', postCode: '972' },
      { id: 4, cityId: 18, name: '壽豐鄉', postCode: '973' },
      { id: 5, cityId: 18, name: '鳳林鎮', postCode: '974' },
      { id: 6, cityId: 18, name: '光復鄉', postCode: '975' },
      { id: 7, cityId: 18, name: '豐濱鄉', postCode: '976' },
      { id: 8, cityId: 18, name: '瑞穗鄉', postCode: '977' },
      { id: 9, cityId: 18, name: '富里鄉', postCode: '978' },
      { id: 10, cityId: 18, name: '秀林鄉', postCode: '979' },
      { id: 11, cityId: 18, name: '花蓮港區', postCode: '980' },
      // 台東縣
      { id: 1, cityId: 19, name: '台東市', postCode: '950' },
      { id: 2, cityId: 19, name: '綠島鄉', postCode: '951' },
      { id: 3, cityId: 19, name: '蘭嶼鄉', postCode: '952' },
      { id: 4, cityId: 19, name: '延平鄉', postCode: '953' },
      { id: 5, cityId: 19, name: '卑南鄉', postCode: '954' },
      { id: 6, cityId: 19, name: '鹿野鄉', postCode: '955' },
      { id: 7, cityId: 19, name: '關山鎮', postCode: '956' },
      { id: 8, cityId: 19, name: '海端鄉', postCode: '957' },
      { id: 9, cityId: 19, name: '池上鄉', postCode: '958' },
      { id: 10, cityId: 19, name: '東河鄉', postCode: '959' },
      { id: 11, cityId: 19, name: '長濱鄉', postCode: '961' },
      { id: 12, cityId: 19, name: '太麻里鄉', postCode: '962' },
      { id: 13, cityId: 19, name: '金峰鄉', postCode: '963' },
      { id: 14, cityId: 19, name: '大武鄉', postCode: '964' },
      { id: 15, cityId: 19, name: '達仁鄉', postCode: '965' },
      // 澎湖縣
      { id: 1, cityId: 20, name: '馬公市', postCode: '880' },
      { id: 2, cityId: 20, name: '西嶼鄉', postCode: '881' },
      { id: 3, cityId: 20, name: '望安鄉', postCode: '882' },
      { id: 4, cityId: 20, name: '湖西鄉', postCode: '883' },
      { id: 5, cityId: 20, name: '白沙鄉', postCode: '884' },
      { id: 6, cityId: 20, name: '六腳鄉', postCode: '885' },
      // 金門縣
      { id: 1, cityId: 21, name: '金城鎮', postCode: '893' },
      { id: 2, cityId: 21, name: '金湖鎮', postCode: '894' },
      { id: 3, cityId: 21, name: '金寧鄉', postCode: '895' },
      { id: 4, cityId: 21, name: '烈嶼鄉', postCode: '896' },
      { id: 5, cityId: 21, name: '烏坵鄉', postCode: '897' },
      // 連江縣
      { id: 1, cityId: 22, name: '南竿鄉', postCode: '209' },
      { id: 2, cityId: 22, name: '北竿鄉', postCode: '210' },
      { id: 3, cityId: 22, name: '莒光鄉', postCode: '211' },
      { id: 4, cityId: 22, name: '東引鄉', postCode: '212' }
    ];
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

      this.http.post<any>('http://localhost:8080/qrcode/store/createStore', formData).subscribe({
        next: (response) => {
          localStorage.setItem('user', JSON.stringify(response.data));
          this.router.navigate(['/']);
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