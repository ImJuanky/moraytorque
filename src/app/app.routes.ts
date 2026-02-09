import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Catalog } from './pages/catalog/catalog';
import { Configurator } from './pages/configurator/configurator';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { Orders } from './pages/orders/orders';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'catalog', component: Catalog },
  { path: 'configurator', component: Configurator },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout },
  { path: 'orders', component: Orders },
  { path: '**', redirectTo: '' }
];
