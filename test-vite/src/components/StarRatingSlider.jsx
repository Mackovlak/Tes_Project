import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRatingSlider() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Optional: Descriptive text based on the rating
  const getRatingText = (value) => {
    if (value === 0) return "Select a rating";
    if (value <= 3) return "Poor";
    if (value <= 6) return "Average";
    if (value <= 8) return "Great";
    return "Excellent!";
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 font-sans flex flex-col items-center gap-6">
      
      {/* Dynamic Rating Label */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
          {hoverRating || rating || 0} <span className="text-slate-400 text-xl font-medium">/ 10</span>
        </h2>
        <p className={`text-sm font-medium transition-colors duration-300 mt-1 ${
          (hoverRating || rating) > 8 ? 'text-amber-500' : 
          (hoverRating || rating) > 5 ? 'text-blue-500' : 'text-slate-500'
        }`}>
          {getRatingText(hoverRating || rating)}
        </p>
      </div>

      {/* Star Container */}
      <div 
        className="flex items-center gap-1 sm:gap-2 p-4 bg-slate-50 rounded-2xl shadow-sm border border-slate-100"
        onMouseLeave={() => setHoverRating(0)}
      >
        {[...Array(10)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= (hoverRating || rating);
          const isHovered = starValue === hoverRating;

          return (
            <button
              key={index}
              type="button"
              onClick={() => setRating(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              className="relative p-1 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-full"
              aria-label={`Rate ${starValue} out of 10`}
            >
              <Star
                size={32}
                className={`transition-all duration-300 ${
                  isFilled 
                    ? 'fill-amber-400 text-amber-400' 
                    : 'fill-transparent text-slate-300'
                } ${
                  isHovered ? 'scale-125 drop-shadow-md' : 'hover:scale-110'
                } ${
                  /* Click 'pop' animation applied to the selected rating */
                  rating === starValue && !hoverRating ? 'animate-bounce' : ''
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Clear Button (Optional) */}
      <button 
        onClick={() => setRating(0)}
        className="text-xs text-slate-400 hover:text-slate-700 underline underline-offset-2 transition-colors"
      >
        Clear rating
      </button>

    </div>
  );
}
