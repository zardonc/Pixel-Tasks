import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PixelCard, PixelButton } from '../components/ui/PixelComponents';
import { HelpCircle, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark">
      <PixelCard className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <span className="text-8xl filter drop-shadow-sm select-none animate-bounce block">
              🐶
            </span>
            <div className="absolute -top-4 -right-4 bg-red-100 dark:bg-red-900 border-2 border-black rounded-full p-2 animate-pulse">
                <HelpCircle size={32} className="text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-2xl font-bold uppercase">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Uh oh! It looks like you've wandered into unmapped territory.
          </p>
        </div>

        <div className="pt-4">
          <PixelButton 
            onClick={() => navigate('/')} 
            fullWidth 
            variant="primary"
          >
            <Home size={20} />
            Return Home
          </PixelButton>
        </div>
      </PixelCard>
    </div>
  );
};
