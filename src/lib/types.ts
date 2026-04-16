export type Category = 'Alimentos' | 'Bebidas' | 'Limpeza' | 'Higiene' | 'Pet' | 'Outros';

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  qty: number;
  price: number;
  category: Category;
  created_at?: string;
}

export interface ShoppingListItem {
  id: string;
  invId: string | null;
  name: string;
  qty: number;
  price: number;
}