export type Category = 'manillar' | 'escape' | 'sticker' | 'config';


    export interface Product {
        id:number;
        name: string;
        category: Category;
        price: number;
        imageUrl: string;
        description: string;
    }