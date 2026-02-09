import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Catalog } from './pages/catalog/catalog';
import { Configurator } from './pages/configurator/configurator';
import { Cart } from './pages/cart/cart';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'catalog', component: Catalog },
  { path: 'configurator', component: Configurator },
  { path: 'cart', component: Cart },
  { path: '**', redirectTo: '' }
];
