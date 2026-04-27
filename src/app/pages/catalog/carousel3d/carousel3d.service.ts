// carousel3d.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../../../models/product.model';

@Injectable({ providedIn: 'root' })
export class Carousel3dService {
  private _activeIndex = new BehaviorSubject<number>(0);
  activeIndex$ = this._activeIndex.asObservable();
  private _products = new BehaviorSubject<Product[]>([]);
  products$ = this._products.asObservable();

  setProducts(p: Product[]): void { this._products.next(p); }
  get currentIndex(): number { return this._activeIndex.value; }
  get total(): number { return this._products.value.length; }
  goTo(index: number): void {
    const n = this.total;
    if (!n) return;
    this._activeIndex.next(((index % n) + n) % n);
  }
  next(): void { this.goTo(this.currentIndex + 1); }
  prev(): void { this.goTo(this.currentIndex - 1); }
}