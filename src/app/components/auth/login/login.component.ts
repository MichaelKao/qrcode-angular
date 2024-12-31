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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
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
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar, private router: Router, private location: Location, private apiService: ApiService) {
    this.loginForm = this.fb.group({
      account: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {

      this.apiService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            localStorage.setItem('user', JSON.stringify(response.data));
            this.router.navigate(['/']); 
          } else {
            this.snackBar.open(response.code + ':' + response.message, '關閉', { duration: 3000 });
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
    this.location.back(); 
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

}
