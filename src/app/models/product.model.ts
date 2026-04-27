export type Category = 'manillar' | 'escape' | 'sticker' | 'config';

export interface Product {
  id:          number;
  name:        string;
  category:    Category;
  price:       number;
  imageUrl:    string;
  modelUrl?:   string;   // opcional — si existe, muestra visor 3D
  description: string;
}