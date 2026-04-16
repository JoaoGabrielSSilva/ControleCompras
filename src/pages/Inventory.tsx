import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { formatBRL, generateId } from '../lib/utils';
import type { Category } from '../lib/types';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function Inventory() {
  const { items, loading, addItem, updateItem, deleteItem } = useInventory();
  const [newItem, setNewItem] = useState({ 
    name: '', 
    qty: 1, 
    price: 0, 
    category: 'Outros' as Category 
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    
    const existing = items.find(i => 
      i.name.toLowerCase() === newItem.name.toLowerCase() && 
      i.category === newItem.category
    );
    
    if (existing) {
      await updateItem(existing.id, {
        qty: existing.qty + newItem.qty,
        price: newItem.price
      });
    } else {
      await addItem({ ...newItem });
    }
    
    setNewItem({ name: '', qty: 1, price: 0, category: 'Outros' });
  };

  const categories: Category[] = ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene', 'Pet', 'Outros'];

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  if (loading) return <div className="text-center py-8 text-muted-foreground">Carregando estoque...</div>;

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input
                placeholder="Nome do item"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
              />
              
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as Category })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <Input
                type="number"
                placeholder="Qtd"
                min="0"
                step="any"
                value={newItem.qty || ''}
                onChange={(e) => setNewItem({ ...newItem, qty: parseFloat(e.target.value) || 0 })}
              />
              
              <Input
                type="number"
                placeholder="Preço"
                min="0"
                step="0.01"
                value={newItem.price || ''}
                onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Adicionar ao Estoque
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, categoryItems]) => (
          <div key={category}>
            <h3 className="font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <span>📂</span> {category}
            </h3>
            <div className="rounded-lg border bg-card divide-y divide-border">
              {categoryItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.qty} un. • {formatBRL(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateItem(item.id, { qty: Math.max(0, item.qty - 1) })}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, { qty: parseFloat(e.target.value) || 0 })}
                        className="w-14 h-8 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateItem(item.id, { qty: item.qty + 1 })}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                      className="w-20 h-8"
                      step="0.01"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteItem(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                Nenhum item no estoque. Adicione seu primeiro item acima!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}