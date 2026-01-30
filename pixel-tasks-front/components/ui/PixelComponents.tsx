import React from 'react';
import { motion } from 'framer-motion';

interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noShadow?: boolean;
}

export const PixelCard: React.FC<PixelCardProps> = ({ children, className = '', onClick, noShadow }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-card-light dark:bg-card-dark 
        border-3 border-black dark:border-white 
        ${noShadow ? '' : 'shadow-pixel dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]'} 
        p-4 sm:p-6 relative transition-transform
        ${onClick ? 'active:translate-y-1 active:shadow-pixel-active cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const PixelButton: React.FC<PixelButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary text-black hover:bg-yellow-400',
    secondary: 'bg-secondary text-black hover:bg-green-400',
    danger: 'bg-accent text-white hover:bg-red-500',
    outline: 'bg-transparent border-3 border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
    ghost: 'bg-transparent border-none shadow-none text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
  };

  const shadowClass = variant === 'ghost' ? '' : 'shadow-pixel hover:shadow-pixel-sm active:shadow-pixel-active active:translate-x-[2px] active:translate-y-[2px]';
  const borderClass = variant === 'ghost' ? '' : 'border-3 border-black dark:border-white';

  return (
    <button
      className={`
        ${variants[variant]}
        ${borderClass}
        ${shadowClass}
        ${fullWidth ? 'w-full' : ''}
        py-3 px-6 text-xl font-bold uppercase tracking-wide
        transition-all duration-100
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const PixelModal: React.FC<PixelModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dither Background Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm bg-dither bg-[length:4px_4px]"
      />
      
      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative z-10 w-full max-w-lg bg-background-light dark:bg-card-dark border-3 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 border-b-3 border-black dark:border-white bg-black text-white">
            <h2 className="text-2xl uppercase tracking-widest">{title}</h2>
            <button onClick={onClose} className="hover:text-red-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        <div className="p-6 overflow-y-auto">
            {children}
        </div>
      </motion.div>
    </div>
  );
};

interface PixelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const PixelInput: React.FC<PixelInputProps> = ({ label, className = '', ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-xl uppercase font-bold text-gray-700 dark:text-gray-200">{label}</label>}
    <input 
      className={`
        w-full bg-white dark:bg-gray-800 
        border-3 border-black dark:border-gray-500
        p-3 text-xl outline-none
        focus:shadow-pixel-sm focus:border-primary dark:focus:border-primary
        transition-all placeholder:text-gray-400
        ${className}
      `}
      {...props} 
    />
  </div>
);
