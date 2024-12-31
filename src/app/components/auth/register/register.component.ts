// src/app/components/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { timer } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,  
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  standalone: true
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSendingCode = false;
  isVerificationCodeSent = false;
  timeRemaining = 0; // 倒計時秒數


  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar, private router: Router, private location: Location, private apiService: ApiService) {
    this.registerForm = this.fb.group({
      account: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      code: ['', Validators.required]
    });
  }

  // 發送驗證碼
  sendVerificationCode(): void {
    // 取得 email 的值
    const email = this.registerForm.get('email')?.value; 

    if (this.registerForm.get('email')?.invalid) {
      // 若 email 欄位無效，顯示錯誤訊息
      this.snackBar.open('請輸入有效的電子郵件地址', '關閉', { duration: 3000 });
      return;
    }

      this.isSendingCode = true;
      this.isVerificationCodeSent = true;
      this.timeRemaining = 60; 

      // 開始倒計時，1秒更新一次
      const subscription = timer(0, 1000).subscribe((time) => {
        this.timeRemaining = 60 - time;
        if (this.timeRemaining <= 0) {
          this.isSendingCode = false; 
          this.isVerificationCodeSent = false;
          subscription.unsubscribe();
        }
      });

      setTimeout(() => {
        this.apiService.sendVerification(email)
        .subscribe({
          next: (response) => {
            alert('驗證碼已發送');
          },
          error: (err) => {
            this.isSendingCode = true;
            alert('發送驗證碼失敗，請稍後再試');
          }
        });
      }, 2000); 
    
  }

  onSubmit() {
    if (this.registerForm.valid) {

      this.apiService.signIn(this.registerForm.value).subscribe({
        next: (response: any) => {
          if (response.code === 200) { 
            localStorage.setItem('user', JSON.stringify(response.data));
            // 註冊成功，跳轉到 home 頁面
            this.router.navigate(['/']);
          } else {
            alert(response.code + ':' + response.message)
          } 
        },
        error: (err) => alert(err)
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']); 
  }

}