'use client';

import React from 'react';
import { Utensils, ChefHat } from 'lucide-react';
import { FamousFoodItem, DestinationDetail } from '@/lib/api';

interface LocalFoodProps {
  destination: DestinationDetail;
  foods?: FamousFoodItem[];
}

export function LocalFood({ destination, foods = [] }: LocalFoodProps) {
  // Compile food items
  const foodItems: { id: string; name: string; description: string; imageUrl?: string | null }[] = [];

  if (foods && foods.length > 0) {
    foods.forEach((f) => {
      foodItems.push({
        id: f.id,
        name: f.dishName,
        description: f.description || 'Authentic regional delicacy',
        imageUrl: f.imageUrl || null,
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
          imageUrl: null,
        });
      }
    });
  }

  const displayFoods = foodItems.slice(0, 4);

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-base md:text-lg font-bold text-stone-900 flex items-center gap-2">
          <Utensils className="h-4.5 w-4.5 text-amber-500" />
          <span>Local Food & Flavors</span>
        </h2>
      </div>

      {/* Content */}
      {displayFoods.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-5 text-center">
          <ChefHat className="h-6 w-6 text-stone-400 mb-1.5" />
          <h4 className="text-xs font-bold text-stone-800">
            Cuisine details being updated
          </h4>
          <p className="text-[11px] text-stone-500 max-w-xs mt-1">
            Famous culinary traditions and dishes for {destination.destinationName} will appear shortly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 flex-1">
          {displayFoods.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col rounded-2xl border border-stone-200/80 bg-stone-50/50 p-2 hover:shadow-md hover:border-amber-300 transition-all duration-200"
            >
              {item.imageUrl ? (
                <div className="relative h-18 sm:h-20 w-full overflow-hidden rounded-xl bg-stone-200 mb-1.5">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="relative h-18 sm:h-20 w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-stone-100 border border-amber-200/40 flex flex-col items-center justify-center p-2 mb-1.5 text-center">
                  <div className="h-7 w-7 rounded-lg bg-white/90 shadow-2xs flex items-center justify-center text-amber-600 mb-1">
                    <Utensils className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 line-clamp-1">
                    Authentic Specialty
                  </span>
                </div>
              )}
              <h3 className="text-[11px] sm:text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
