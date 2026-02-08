import { Injectable } from "@angular/core";
import { Product } from "../models/product.model";
@Injectable ({providedIn:'root'})
export class ProductsService {
    private readonly products: Product[] = [
        {
            id: 1,
            name: 'Manillar MT-07 Negro',
            category: 'manillar',
            price: 79.99,
            imageUrl: 'https://cdn.wallapop.com/images/10420/k2/xs/__/c10420p1214259418/i6186087928.jpg?pictureSize=W640',
            description: 'Manillar compatible con Yamaha MT-07. Color negro mate.'
        },
        {
            id: 2,
            name: 'Manillar MT-07 Rojo',
            category: 'manillar',
            price: 89.99,
            imageUrl: 'https://www.rizoma.com/wp-content/uploads/rizoma/media/2/4/2494022371_WEB_S0MA0001R0000021XXX.jpg-1000x1000.jpg',
            description: 'Manillar compatible con Yamaha MT-07. Color rojo.'
          },
          {
            id: 3,
            name: 'Escape SC Project',
            category: 'escape',
            price: 299.99,
            imageUrl: 'https://cdn.unobike.com/content/productos/37747-y20-t36cr.jpg',
            description: 'Escape deportivo homologado.'
          },
          {
            id: 4,
            name: 'Sticker Kit “Neon”',
            category: 'sticker',
            price: 24.99,
            imageUrl: 'https://cdn.quickbutik.com/images/9603t/products/625588b9c07d2.jpeg',
            description: 'Kit de stickers para la MT-07, estilo neón.'
          }
    ];
    getAll():Product[] {
        return this.products;
    }
}