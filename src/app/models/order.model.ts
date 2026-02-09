import { CartItem } from "../services/cart.service"

export interface Order {
    id: string,
    createdAt: string,
    name: string,
    address: string,
    items: CartItem[];
    total: number;
    
}