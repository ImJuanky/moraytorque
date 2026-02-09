import { Injectable } from "@angular/core";
import { Order } from "../models/order.model";

const STORAGE_KEY = 'moray_orders_v1';
@Injectable({ providedIn: 'root' })
export class OrdersService {
  private orders: Order[] = this.load();

  getAll(): Order[] {
    return this.orders;
  }

  create(order: Order) {
    this.orders.unshift(order);
    this.save();
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders));
  }
  
  private load(): Order [] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as Order [];
    } catch {
localStorage.removeItem(STORAGE_KEY);
return[];
    }
  }
}