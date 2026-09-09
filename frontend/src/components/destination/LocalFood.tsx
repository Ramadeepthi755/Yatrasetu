'use client';

import React from 'react';
import { Utensils, Sparkles, ChefHat } from 'lucide-react';
import { FamousFoodItem, DestinationDetail } from '@/lib/api';

interface LocalFoodProps {
  destination: DestinationDetail;
  foods?: FamousFoodItem[];
}

export function LocalFood({ destination, foods = [] }: LocalFoodProps) {
  // Helper for food images
  const getFoodImage = (dishName: string, index: number) => {
    const lower = dishName.toLowerCase();
    if (lower.includes('chicken') || lower.includes('bamboo') || lower.includes('meat') || lower.includes('curry'))
      return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80';
    if (lower.includes('coffee') || lower.includes('tea') || lower.includes('brew'))
      return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80';
    if (lower.includes('millet') || lower.includes('rice') || lower.includes('thali') || lower.includes('dosa') || lower.includes('idli'))
      return 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=400&q=80';
    if (lower.includes('sweet') || lower.includes('halwa') || lower.includes('laddu') || lower.includes('dessert'))
      return 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80';

    const stockFoods = [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    ];
    return stockFoods[index % stockFoods.length];
  };

  // Compile food items
  const foodItems: { id: string; name: string; description: string; imageUrl: string }[] = [];

  if (foods && foods.length > 0) {
    foods.forEach((f, idx) => {
      foodItems.push({
        id: f.id,
        name: f.dishName,
        description: f.description || 'Authentic regional delicacy',
        imageUrl: f.imageUrl || getFoodImage(f.dishName, idx),
      });
    });
  } else if (destination.localCuisineMustTry) {
    const rawList = destination.localCuisineMustTry.split('|');
    rawList.forEach((dish, idx) => {
      const clean = dish.trim();
      if (clean) {
        foodItems.push({
          id: `food-fallback-${idx}`,
          name: clean,
          description: `Must-try authentic local specialty of ${destination.destinationName}`,
          imageUrl: getFoodImage(clean, idx),
        });
      }
    });
  }

  const displayFoods = foodItems.slice(0, 4);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-base md:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Utensils className="h-4.5 w-4.5 text-amber-500" />
          <span>Local Food & Flavors</span>
        </h2>
      </div>

      {/* Content */}
      {displayFoods.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 p-5 text-center">
          <ChefHat className="h-6 w-6 text-stone-400 mb-1.5" />
          <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
            Cuisine details being updated
          </h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs mt-1">
            Famous culinary traditions and dishes for {destination.destinationName} will appear shortly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 flex-1">
          {displayFoods.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-2 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700/50 transition-all duration-200"
            >
              <div className="relative h-18 sm:h-20 w-full overflow-hidden rounded-xl bg-stone-200 dark:bg-stone-700 mb-1.5">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <h3 className="text-[11px] sm:text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-amber-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
