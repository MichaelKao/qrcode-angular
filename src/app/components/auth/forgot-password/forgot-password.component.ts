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
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar, private router: Router, private location: Location, private apiService: ApiService) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;

      if (this.forgotPasswordForm.get('email')?.invalid) {
        // 若 email 欄位無效，顯示錯誤訊息
        this.snackBar.open('請輸入有效的電子郵件地址', '關閉', { duration: 3000 });
        return;
      }


      const url = `http://localhost:8080/qrcode/user/forgetPassword/${encodeURIComponent(email)}`;

      this.apiService.forgetPassword(email)
        .subscribe({
          next: (response: any) => {
            if (response.code === 200) {
              this.snackBar.open('密碼已發送至您的電子郵件', '關閉', { duration: 3000 });
              this.router.navigate(['/login']);
            } else {
              this.snackBar.open(response.code + ':' + response.message, '關閉', { duration: 3000 });
            }
          },
          error: (err) => {

          }
        });
    } else {
      this.snackBar.open('請輸入有效的電子郵件地址', '關閉', { duration: 3000 });
    }
  }

  goBack(): void {
    this.location.back();
  }

}
