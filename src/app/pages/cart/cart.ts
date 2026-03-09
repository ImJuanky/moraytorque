import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {
  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  goToCheckout() {
    if (this.cartService.getItems().length > 0) {
      this.router.navigateByUrl('/checkout');
    }
  }

  clearCart() {
    if (this.cartService.getItems().length > 0 && confirm('¿Seguro que quieres vaciar el carrito?')) {
      this.cartService.clear();
    }
  }

  increaseQuantity(item: CartItem) {
    console.log('Aumentar cantidad:', item);
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      console.log('Disminuir cantidad:', item);
    }
  }

  removeItem(item: CartItem) {
    if (confirm(`¿Eliminar ${this.getItemName(item)} del carrito?`)) {
      console.log('Eliminar:', item);
    }
  }

  // Métodos helper para manejar configuraciones
  isConfiguration(item: CartItem): boolean {
    return item.product?.category === 'config' || !!item.product?.description?.includes('Color:');
  }

  getItemName(item: CartItem): string {
    if (item.product?.name) {
      return item.product.name;
    }
    return 'Configuración personalizada';
  }

  getItemDescription(item: CartItem): string {
    if (item.product?.description) {
      // Si es una configuración, intenta parsear el estado
      if (this.isConfiguration(item)) {
        try {
          const config = JSON.parse(item.product.description);
          const parts = [];
          if (config.color) parts.push(`Color: ${config.color}`);
          if (config.stickers) parts.push('Stickers');
          if (config.sportExhaust) parts.push('Escape sport');
          return parts.join(' • ');
        } catch (e) {
          return item.product.description;
        }
      }
      return item.product.description;
    }
    return 'Configuración de MT-07';
  }

  getItemImage(item: CartItem): string {
    return item.product?.imageUrl || '/images/mt07/mt07-black.png';
  }

  getItemPrice(item: CartItem): number {
    return item.product?.price || 0;
  }

  getItemSubtotal(item: CartItem): number {
    return (item.product?.price || 0) * item.quantity;
  }

  getItemColor(item: CartItem): string | null {
    if (item.product?.description) {
      try {
        const config = JSON.parse(item.product.description);
        return config.color || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}