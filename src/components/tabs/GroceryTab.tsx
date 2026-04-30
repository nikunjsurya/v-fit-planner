import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../context/AppContext';
import { CheckCircle2, Plus, Trash2, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

export default function GroceryTab() {
  const { groceries, setGroceries } = useAppContext();
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(groceries[0]?.id || '');

  useEffect(() => {
    if (groceries.some(cat => cat.id === selectedCategory)) return;
    setSelectedCategory(groceries[0]?.id ?? '');
  }, [groceries, selectedCategory]);

  const toggleItem = (categoryId: string, itemId: string) => {
    setGroceries(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)
        };
      }
      return cat;
    }));
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    setGroceries(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.filter(item => item.id !== itemId)
        };
      }
      return cat;
    }));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !selectedCategory) return;
    
    setGroceries(prev => prev.map(cat => {
      if (cat.id === selectedCategory) {
        return {
          ...cat,
          items: [...cat.items, { id: uuidv4(), name: newItemName.trim(), checked: false }]
        };
      }
      return cat;
    }));
    setNewItemName('');
  };

  const uncheckAll = () => {
    setGroceries(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item => ({ ...item, checked: false }))
    })));
  };

  const autoGenerate = () => {
    const weeklyEssentials = [
      { category: 'Protein', name: 'Soya Chunks' },
      { category: 'Protein', name: 'Tofu / Paneer / Chana' },
      { category: 'Protein', name: 'Whey Protein' },
      { category: 'Protein', name: 'Greek Yogurt' },
      { category: 'Carbs', name: 'Basmati Rice' },
      { category: 'Carbs', name: 'Bananas' },
      { category: 'Other', name: 'Mixed Vegetables' },
      { category: 'Other', name: 'Creatine' },
    ];

    setGroceries(prev => {
      return prev.map(cat => {
        const additions = weeklyEssentials.filter(item => {
          if (item.category !== cat.category) return false;
          return !cat.items.some(i => i.name.toLowerCase() === item.name.toLowerCase());
        });
        if (additions.length === 0) return cat;
        return {
          ...cat,
          items: [
            ...additions.map(item => ({ id: uuidv4(), name: item.name, checked: false })),
            ...cat.items,
          ],
        };
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Grocery List</h2>
          <p className="text-sm text-slate-400">Keep track of your prep ingredients.</p>
        </div>
        <Button variant="outline" size="sm" onClick={uncheckAll}>Reset All</Button>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          <p className="font-bold text-emerald-400 mb-1 flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Meal Prep Generator</p>
          <p className="text-emerald-200/80 text-xs">Instantly add staples for your weekly curries and shakes.</p>
        </div>
        <Button onClick={autoGenerate} size="sm" className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 w-full sm:w-auto shrink-0 shadow-lg shadow-emerald-500/20">
          Auto-Fill Staples
        </Button>
      </div>

      <form onSubmit={addItem} className="flex gap-2 mb-6">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
        >
          {groceries.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.category}</option>
          ))}
        </select>
        <input 
          type="text" 
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="New item..."
          className="flex-1 bg-slate-900 border border-slate-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500 placeholder-slate-500"
        />
        <Button type="submit" size="icon" className="shrink-0"><Plus className="w-5 h-5"/></Button>
      </form>

      <div className="space-y-6">
        {groceries.map(cat => (
          <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
            <h3 className="font-medium text-emerald-400 mb-3 border-b border-slate-800 pb-2 uppercase tracking-wide text-xs">{cat.category}</h3>
            <div className="space-y-1">
              {cat.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-2 px-2 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-800/40 group transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleItem(cat.id, item.id)}
                    aria-label={item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
                    aria-pressed={item.checked}
                    className="text-emerald-500 shrink-0"
                  >
                    {item.checked ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-slate-700 rounded-lg"></div>}
                  </button>
                  <span className={`flex-1 text-sm select-none font-medium ${item.checked ? 'text-slate-600 line-through' : 'text-slate-200'}`}>
                    {item.name}
                  </span>
                  <button 
                    type="button"
                    onClick={() => deleteItem(cat.id, item.id)}
                    aria-label={`Delete ${item.name}`}
                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1 bg-slate-800 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
