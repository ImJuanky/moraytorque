import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../services/orders.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  orders: Order[] = [];

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orders = this.ordersService.getAll();
  }

  formatOrderId(id: string): string {
    if (!id) return '';
    // Muestra solo los primeros 8 caracteres del UUID
    return id.substring(0, 8).toUpperCase();
  }

  calculateSubtotal(order: Order): number {
    return order.items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);
  }

  repeatOrder(order: Order): void {
    // Aquí iría la lógica para repetir el pedido
    console.log('Repetir pedido:', order);
    alert('Función de repetir pedido (demo)');
  }
}