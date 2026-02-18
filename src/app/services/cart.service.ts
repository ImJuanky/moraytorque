// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {  // <-- TIENE QUE ESTAR EXPORTADA
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];

  add(product: Product): void {
    const existing = this.items.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ product, quantity: 1 });
    }
  }

  getItems(): CartItem[] {
    return this.items;
  }

  getCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getTotal(): number {
    return this.items.reduce(
      (total, item) => total + (item.product.price * item.quantity), 0
    );
  }

  clear(): void {
    this.items = [];
  }
}