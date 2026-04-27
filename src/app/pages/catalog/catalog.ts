import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProductsService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { Product, Category } from '../../models/product.model';
import { Carousel3dComponent } from './carousel3d/carousel3d.component';
import { ModelViewerComponent } from './model-viewer/model-viewer.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, HttpClientModule, Carousel3dComponent, ModelViewerComponent],
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.css']
})
export class Catalog implements OnInit {

  products: Product[] = [];
  filtered: Product[] = [];
  selectedCategory: Category | 'all' = 'all';
  currentTheme: 'light' | 'dark' = 'dark';

  constructor(
    private productsService: ProductsService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.productsService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.filtered = products;
      },
      error: (err) => console.error('Error cargando productos:', err)
    });
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
  }

  setCategory(category: Category | 'all'): void {
    this.selectedCategory = category;
    this.filtered = category === 'all'
      ? this.products
      : this.products.filter(p => p.category === category);
  }

  addToCart(product: Product): void {
    this.cartService.add(product);
    alert(`✅ Añadido al carrito: ${product.name}`);
  }

  getCategoryCount(category: string): number {
    return this.products.filter(p => p.category === category).length;
  }

  quickView(product: Product): void {
    alert(`🏍️ ${product.name}\n\n📝 ${product.description}\n\n💰 ${product.price}€`);
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      manillar: 'Puños',
      escape:   'Escape',
      sticker:  'Stickers',
      config:   'Config',
    };
    return labels[category] ?? category;
  }

  getUniqueCategories(): number {
    return new Set(this.products.map(p => p.category)).size;
  }
}