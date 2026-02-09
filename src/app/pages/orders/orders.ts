import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders {
  constructor(public ordersService: OrdersService) {}
}
