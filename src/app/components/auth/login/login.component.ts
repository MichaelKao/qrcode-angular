import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule, // 引入 HttpClientModule
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  standalone: true
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar, private router: Router, private location: Location) {
    this.loginForm = this.fb.group({
      account: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.http.post('http://localhost:8080/qrcode/user/login', this.loginForm.value).subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            this.snackBar.open('登入成功', '關閉', { duration: 3000 });
            localStorage.setItem('user', response.data.account); // 儲存使用者資料
            this.router.navigate(['/']); // 跳轉到首頁
          } else {
            this.snackBar.open('登入失敗，請檢查帳號或密碼', '關閉', { duration: 3000 });
          }
          
        },
        error: () => {
          this.snackBar.open('登入失敗，請檢查帳號或密碼', '關閉', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('請完整填寫表單', '關閉', { duration: 3000 });
    }
  }

  goBack(): void {
    this.location.back(); // 返回上一頁
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']); // 跳转到忘记密码页面
  }

}
