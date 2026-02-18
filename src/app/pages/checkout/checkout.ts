// src/app/pages/checkout/checkout.ts (está bien, no necesita cambios)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {
  name = '';
  address = '';
  success = false;

  constructor(
    public cartService: CartService,
    private ordersService: OrdersService,
    private router: Router
  ) {
    if (this.cartService.getItems().length === 0) {
      this.router.navigateByUrl('/cart');
    }
  }

  confirmOrder() {
    if (!this.name.trim() || !this.address.trim()) {
      alert('Completa nombre y dirección');
      return;
    }

    const order: Order = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name: this.name.trim(),
      address: this.address.trim(),
      items: this.cartService.getItems(), // Ahora devuelve CartItem[]
      total: this.cartService.getTotal()   // Este método lo añadimos arriba
    };

    this.ordersService.create(order);
    this.cartService.clear();
    this.success = true;
  }
}