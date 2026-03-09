import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; 
import { ProductsService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { Product, Category } from '../../models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.css']
})
export class Catalog implements OnInit {
  products: Product[] = [];
  filtered: Product[] = [];
  selectedCategory: Category | 'all' = 'all';

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
      error: (error) => {
        console.error('Error cargando productos:', error);
        alert('Error al cargar los productos. Por favor, intenta de nuevo.');
      }
    });
  }

  /**
   * Cambia la categoría seleccionada y filtra los productos
   */
  setCategory(category: Category | 'all'): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filtered = this.products;
    } else {
      this.filtered = this.products.filter(
        (product) => product.category === category
      );
    }
  }

  /**
   * Añade un producto al carrito
   */
  addToCart(product: Product): void {
    this.cartService.add(product);
    alert(`✅ Añadido al carrito: ${product.name}`);
  }

  /**
   * Obtiene el número de productos en una categoría específica
   */
  getCategoryCount(category: string): number {
    return this.products.filter(p => p.category === category).length;
  }

  /**
   * Obtiene el icono correspondiente a cada categoría
   */
  getCategoryIcon(category: string): string {
    switch(category) {
      case 'manillar': return '🏍️';
      case 'escape': return '⚡';
      case 'sticker': return '✨';
      default: return '🔧';
    }
  }

  /**
   * Vista rápida del producto (muestra información detallada)
   */
  quickView(product: Product): void {
    // Aquí podrías implementar un modal más elegante
    // Por ahora usamos un alert mejorado
    const message = `
      🏍️ ${product.name}
      
      📝 ${product.description}
      
      💰 Precio: ${product.price}€
      📦 Categoría: ${product.category}
    `;
    
    alert(message);
  }

  /**
   * Obtiene el número total de categorías únicas
   */
  getUniqueCategories(): number {
    return new Set(this.products.map(p => p.category)).size;
  }

  /**
   * Verifica si hay productos disponibles
   */
  hasProducts(): boolean {
    return this.products.length > 0;
  }

  /**
   * Obtiene el nombre de la categoría actual para mostrar
   */
  getCurrentCategoryName(): string {
    if (this.selectedCategory === 'all') {
      return 'todos los productos';
    }
    return this.selectedCategory;
  }

  /**
   * Limpia los filtros (vuelve a 'all')
   */
  clearFilters(): void {
    this.setCategory('all');
  }
}