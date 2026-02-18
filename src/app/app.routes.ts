// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Catalog } from './pages/catalog/catalog';
import { Configurator } from './pages/configurator/configurator';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { Orders } from './pages/orders/orders';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'catalog', component: Catalog },
  { path: 'configurator', component: Configurator, canActivate: [authGuard] }, // Protegida
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout, canActivate: [authGuard] }, // Protegida
  { path: 'orders', component: Orders, canActivate: [authGuard] }, // Protegida
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' }
];