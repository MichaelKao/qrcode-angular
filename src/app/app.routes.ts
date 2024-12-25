import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { DashboardComponent } from './components/merchant/dashboard/dashboard.component';
import { QrManagementComponent } from './components/merchant/qr-management/qr-management.component';
import { MenuManagementComponent } from './components/merchant/menu-management/menu-management.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'auth', 
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent }
    ]
  },
  {
    path: 'merchant',
    // canActivate: [AuthGuard],  // 需要先建立 AuthGuard
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'qr-management', component: QrManagementComponent },
      { path: 'menu-management', component: MenuManagementComponent }
    ]
  }
];