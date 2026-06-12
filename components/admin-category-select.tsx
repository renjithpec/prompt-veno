"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";

export function AdminCategorySelect({ categories }: { categories: Category[] }) {
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  
  const toggleCat = (id: string) => {
    setSelectedCats(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
        <span>Categories</span>
        <span className={selectedCats.length === 3 ? "text-accent font-bold" : ""}>{selectedCats.length}/3</span>
      </label>
      <input type="hidden" name="category_ids" value={selectedCats.join(",")} />
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCats.includes(category.id);
          return (
            <button
              type="button"
              key={category.id}
              onClick={() => toggleCat(category.id)}
              className={`rounded border px-3 py-1.5 text-xs font-medium transition-all ${
                isSelected ? "border-accent bg-accent/20 text-accent" : "border-border bg-foreground/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
