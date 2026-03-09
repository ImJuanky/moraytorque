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
  return `MT-07 Config (${parts.join(' + ')})`;
}
addConfigToCart() {
  const product: Product = {
    id: Date.now(),
    name: this.configName,
    category: 'config',
    price: this.configPrice,
    imageUrl: this.imageUrl,
    description: JSON.stringify(this.state)
  };

  this.cartService.add(product);
  alert('Configuración añadida al carrito ✅');
}

// Añade estos métodos a tu configurator.ts

hasActiveOptions(): boolean {
  return this.state.stickers || this.state.sportExhaust;
}

getColorName(): string {
  switch(this.state.color) {
    case 'black': return 'Negro';
    case 'blue': return 'Azul';
    case 'red': return 'Rojo';
    default: return 'Negro';
  }
}

getColorGradient(): string {
  switch(this.state.color) {
    case 'black': return 'linear-gradient(135deg, #1a1a1a, #4a5568)';
    case 'blue': return 'linear-gradient(135deg, #4facfe, #00f2fe)';
    case 'red': return 'linear-gradient(135deg, #ff6b6b, #ff4757)';
    default: return 'linear-gradient(135deg, #1a1a1a, #4a5568)';
  }
}

isConfigSaved(): boolean {
  // Compara con configuración por defecto
  const defaultConfig = { color: 'black', stickers: false, sportExhaust: false };
  return JSON.stringify(this.state) !== JSON.stringify(defaultConfig);
}

constructor(private cartService: CartService) {}


}
