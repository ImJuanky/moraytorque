import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

type ColorOption = 'black' | 'blue' | 'red';

interface ConfigState {
  color: ColorOption;
  stickers: boolean;
  sportExhaust: boolean;
}

const STORAGE_KEY = 'moray_config_v1';

@Component({
  selector: 'app-configurator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configurator.html',
  styleUrl: './configurator.css'
})
export class Configurator {
  state: ConfigState = this.load();

  get imageUrl(): string {
    return `/images/mt07/mt07-${this.state.color}.png`;
  }

  setColor(color: ColorOption) {
    this.state.color = color;
    this.save();
  }

  toggleStickers() {
    this.state.stickers = !this.state.stickers;
    this.save();
  }

  toggleSportExhaust() {
    this.state.sportExhaust = !this.state.sportExhaust;
    this.save();
  }

  reset() {
    this.state = { color: 'black', stickers: false, sportExhaust: false };
    this.save();
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  private load(): ConfigState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { color: 'black', stickers: false, sportExhaust: false };
    try {
      return JSON.parse(raw) as ConfigState;
    } catch {
      return { color: 'black', stickers: false, sportExhaust: false };
    }
  }
  get configPrice(): number {
  let total = 0;

  if (this.state.stickers) total += 24.99;
  if (this.state.sportExhaust) total += 299.99;

  return total;
}

get configName(): string {
  const parts: string[] = [`Color: ${this.state.color}`];
  if (this.state.stickers) parts.push('Stickers');
  if (this.state.sportExhaust) parts.push('Escape sport');
  return `Config MT-07 (${parts.join(' + ')})`;
}
addConfigToCart() {
  const product: Product = {
    id: 9000, // fijo por ahora
    name: this.configName,
    category: 'sticker', // da igual por ahora (luego lo mejoramos)
    price: this.configPrice,
    imageUrl: this.imageUrl,
    description: 'Configuración personalizada de la MT-07'
  };

  this.cartService.add(product);
  alert('Configuración añadida al carrito ✅');
}

constructor(private cartService: CartService) {}


}
