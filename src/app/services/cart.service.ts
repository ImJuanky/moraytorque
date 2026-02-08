import { Injectable } from "@angular/core";
import { Product } from "../models/product.model";
export interface CartItem {
    product: Product;
    quantity: number;

}
@Injectable ({providedIn: 'root'})
export class CartService {
    private items: CartItem[] = [];

getItems (): CartItem [] {
    return this.items;
}
add(product: Product) {
    const existing = this.items.find(
        i => i.product.id === product.id
    );

    if (existing){
        existing.quantity++;
    } else {
        this.items.push ({product,quantity: 1});

    }
}
getTotal (): number {
    return this.items.reduce(
        (total, item) =>
            total + item.product.price * item.quantity,
        0
    )
}
}
