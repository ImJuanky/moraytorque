import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

const STORAGE_KEY = 'moray_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: CartItem[] = [];

  constructor() {
    this.items = this.loadFromStorage();
  }

  getItems(): CartItem[] {
    return this.items;
  }

  add(product: Product) {
    const existing = this.items.find(i => i.product.id === product.id);

    if (existing) existing.quantity++;
    else this.items.push({ product, quantity: 1 });

    this.saveToStorage();
  }

  decrease(productId: number) {
    const item = this.items.find(i => i.product.id === productId);
    if (!item) return;

    item.quantity--;
    if (item.quantity <= 0) this.remove(productId);

    this.saveToStorage();
  }

  remove(productId: number) {
    this.items = this.items.filter(i => i.product.id !== productId);
    this.saveToStorage();
  }

  clear() {
    this.items = [];
    this.saveToStorage();
  }

  getTotal(): number {
    return this.items.reduce((t, i) => t + i.product.price * i.quantity, 0);
  }

  private saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
  }

  private loadFromStorage(): CartItem[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as CartItem[];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }
  getCount(): number {
  return this.items.reduce((count, item) => count + item.quantity, 0);
}

}
