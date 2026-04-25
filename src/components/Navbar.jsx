import React from 'react';
import { Sparkles, Image, Home } from 'lucide-react';
import Logo from './Logo';

function Navbar({ currentView, setCurrentView }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bitcoin-darker/90 backdrop-blur-md border-b border-bitcoin-orange/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentView('home')}
          >
            <Logo size={36} />
            <span className="font-display text-base sm:text-xl font-bold text-gradient">Ordinals Are Back</span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex items-center justify-center gap-2 w-11 h-11 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'home'
                  ? 'bg-bitcoin-orange/20 text-bitcoin-orange'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              onClick={() => setCurrentView('card')}
              className={`flex items-center justify-center gap-2 w-11 h-11 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'card'
                  ? 'bg-bitcoin-orange/20 text-bitcoin-orange'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Sat Card</span>
            </button>

            <button
              onClick={() => setCurrentView('meme')}
              className={`flex items-center justify-center gap-2 w-11 h-11 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'meme'
                  ? 'bg-bitcoin-orange/20 text-bitcoin-orange'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Image className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Meme Lab</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
