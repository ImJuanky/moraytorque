import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // <-- AÑADIR ESTA IMPORTACIÓN
import { ProductsService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { Product, Category } from '../../models/product.model';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule  // <-- AÑADIR ESTO A imports
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
        // Mostrar mensaje amigable al usuario
        alert('Error al cargar los productos. Por favor, intenta de nuevo.');
      }
    });
  }

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

  addToCart(product: Product): void {
    this.cartService.add(product);
    alert(`Añadido al carrito: ${product.name}`);
  }
}