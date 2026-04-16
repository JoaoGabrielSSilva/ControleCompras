import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { type InventoryItem, type Category } from '../lib/types';
import { useAuth } from './useAuth';

export function useInventory() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .order('category, name');
    
    if (error) {
      console.error('Erro ao buscar itens:', error);
      return;
    }
    
    setItems(data || []);
    setLoading(false);
  };

  const addItem = async (item: Omit<InventoryItem, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    
    const newItem = { ...item, user_id: user.id };
    const { data, error } = await supabase
      .from('items')
      .insert(newItem)
      .select()
      .single();
    
    if (error) throw error;
    setItems(prev => [...prev, data]);
    return data;
  };

  const updateItem = async (id: string, updates: Partial<Omit<InventoryItem, 'id' | 'user_id'>>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteItem = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  return { items, loading, addItem, updateItem, deleteItem, refresh: fetchItems };
}