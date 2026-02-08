import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Catalog } from './pages/catalog/catalog';
import { Configurator } from './pages/configurator/configurator';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'catalog', component: Catalog },
  { path: 'configurator', component: Configurator },
  { path: '**', redirectTo: '' }
];
