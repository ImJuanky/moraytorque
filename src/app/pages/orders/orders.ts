// src/app/pages/orders/orders.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../services/orders.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  // AÑADE UN COMENTARIO NUEVO AQUÍ para forzar cambio
  orders: Order[] = [];  // <-- FORZANDO RECOMPILACIÓN

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orders = this.ordersService.getAll();
    console.log('Pedidos cargados:', this.orders); // <-- AÑADE ESTO también
  }

  refresh(): void {
    this.loadOrders();
  }
}