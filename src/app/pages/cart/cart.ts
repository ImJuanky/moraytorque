import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {
  constructor(public cartService: CartService, private router: Router) {}

  goToCheckout() {
    this.router.navigateByUrl('/checkout');
  }

  editConfig(configJson: string) {
    // Guardamos la configuración para que el configurador la cargue
    localStorage.setItem('moray_config_v1', configJson);
    this.router.navigateByUrl('/configurator');
  }
}
