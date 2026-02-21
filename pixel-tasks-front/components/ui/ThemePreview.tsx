import React from 'react';
import { ThemeConfig } from '../../types';

interface ThemePreviewProps {
  config: ThemeConfig;
  className?: string;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ config, className = '' }) => {
  if (!config) {
    return (
      <div className={`w-full h-48 bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center ${className}`}>
        No Config Found
      </div>
    );
  }

  // We map the palette directly to inline CSS variables. 
  // Any Tailwind subclass using 'theme-bgBase' or manual CSS will pick this up automatically!
  const previewStyles = {
    '--color-primary': config.palette.primary,
    '--color-secondary': config.palette.secondary,
    '--color-accent': config.palette.accent,
    '--color-bg-base': config.palette.background.base,
    '--color-bg-surface': config.palette.background.surface,
    '--color-text-main': config.palette.text.primary,
    '--radius-global': config.typography.radiusBase,
    '--font-family-pixel': config.typography.fontFamily,
  } as React.CSSProperties;

  return (
    <div 
      className={`w-full h-48 border-2 border-gray-300 dark:border-gray-600 overflow-hidden flex flex-col ${className}`} 
      style={previewStyles}
    >
      {/* Sandbox Container explicitly using local variables */}
      <div 
        className="flex-1 p-3 flex flex-col gap-2 relative transition-colors duration-300"
        style={{ 
          backgroundColor: 'rgb(var(--color-bg-base))', 
          color: 'rgb(var(--color-text-main))',
          fontFamily: 'var(--font-family-pixel)',
          backgroundImage: config.assets?.backgroundUrl ? `url(${config.assets.backgroundUrl})` : 'none',
          backgroundSize: 'cover'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-1 mb-1" style={{ borderColor: 'rgba(var(--color-text-main), 0.2)' }}>
           <div className="font-bold text-sm tracking-widest uppercase">Pixel App</div>
           <div className="w-4 h-4" style={{ backgroundColor: 'rgb(var(--color-primary))', borderRadius: 'var(--radius-global)' }}></div>
        </div>
        
        {/* Surface Card */}
        <div 
          className="flex-1 p-2 flex flex-col justify-between shadow-sm" 
          style={{ 
             backgroundColor: 'rgb(var(--color-bg-surface))',
             borderRadius: 'var(--radius-global)',
             border: config.palette.border ? `1px solid rgb(${config.palette.border})` : 'none'
          }}
        >
          <div className="flex gap-2 items-center">
             <div className="w-6 h-6 flex items-center justify-center text-[10px]" style={{ backgroundColor: 'rgb(var(--color-secondary))', borderRadius: 'var(--radius-global)', color: 'rgb(var(--color-bg-base))' }}>✔</div>
             <div className="h-1.5 w-16 opacity-50" style={{ backgroundColor: 'rgb(var(--color-text-main))', borderRadius: 'var(--radius-global)' }}></div>
          </div>
          
          <button 
            className="w-full py-1.5 mt-2 text-xs font-bold transition-transform hover:scale-[1.02]"
            style={{ 
               backgroundColor: 'rgb(var(--color-primary))', 
               color: 'rgb(var(--color-bg-base))', // Using base background for contrast text
               borderRadius: 'var(--radius-global)'
            }}
          >
            ACTION
          </button>
        </div>
      </div>
    </div>
  );
};
