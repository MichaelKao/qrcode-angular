import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { DashboardComponent } from './components/merchant/dashboard/dashboard.component';


import { QrManagementComponent } from './components/merchant/qr-management/qr-management.component';
import { MenuManagementComponent } from './components/merchant/menu-management/menu-management.component';
import { ProductManagementComponent } from './components/merchant/product-management/product-management.component';
import { ShopComponent } from './components/merchant/shop/shop.component';

import { OrderNotificationComponent } from './components/order-notification/order-notification.component';

import { OrderDetailComponent } from './components/order-details/order-details.component';

import { QrScanComponent } from './components/qr-scan/qr-scan.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'qrcode/provider/:storeSeq/:num',
    component: QrScanComponent
  },
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
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'qr-management', component: QrManagementComponent },
      { path: 'menu-management', component: MenuManagementComponent },
      { path: 'product-management', component: ProductManagementComponent },
      { path: 'shop', component: ShopComponent }
    ]
  },
  {
    path: 'order',
    children: [
      { path: 'order-notification', component: OrderNotificationComponent },
      { path: 'order-details', component: OrderDetailComponent }
    ]
  }
];