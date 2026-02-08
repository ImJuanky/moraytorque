import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../services/products.service';
import { Product, Category } from '../../models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog {
  products: Product[] = [];
  filtered: Product[] = [];
  selectedCategory: Category | 'all' = 'all';

  constructor(private productsService: ProductsService) {
    this.products = this.productsService.getAll();
    this.filtered = this.products;
  }

  setCategory(cat: Category | 'all') {
    this.selectedCategory = cat;
    this.filtered =
      cat === 'all'
        ? this.products
        : this.products.filter(p => p.category === cat);
  }
}
