import React, { useState } from 'react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ClassicMonthSlider() {
  const [value, setValue] = useState(0);

  return (
    <div className="w-full max-w-3xl mx-auto p-12 font-sans">
      <div className="relative w-full">
        
        {/* Animated Floating Tooltip */}
        <div
          className="absolute -top-10 left-0 flex flex-col items-center transition-all duration-300 ease-out"
          style={{ 
            left: `${(value / 11) * 100}%`,
            transform: 'translateX(-50%)' 
          }}
        >
          <span className="bg-slate-800 text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg whitespace-nowrap">
            {months[value]}
          </span>
          {/* Tooltip Arrow */}
          <div className="w-2 h-2 bg-slate-800 rotate-45 -mt-1 shadow-lg"></div>
        </div>

        {/* Native Input Range styled with Tailwind */}
        <input
          type="range"
          min="0"
          max="11"
          step="1"
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
          style={{
            background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(value / 11) * 100}%, #e2e8f0 ${(value / 11) * 100}%, #e2e8f0 100%)`
          }}
        />

        {/* Track Labels */}
        <div className="flex justify-between mt-4 text-xs font-medium px-1">
          {months.map((month, idx) => (
            <span 
              key={month} 
              className={`transition-all duration-300 origin-top ${
                value === idx 
                  ? 'text-indigo-600 font-bold scale-125' 
                  : 'text-slate-400'
              }`}
            >
              {month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
