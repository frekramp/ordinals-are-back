import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import SatCardGenerator from './components/SatCardGenerator';
import MemeGenerator from './components/MemeGenerator';
import IntroSplash from './components/IntroSplash';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="min-h-screen bg-bitcoin-darker noise-bg">
      <AnimatePresence>
        {showIntro && (
          <IntroSplash onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={showIntro ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
      >
        <Navbar currentView={currentView} setCurrentView={setCurrentView} />
        {currentView === 'home' && <LandingPage setCurrentView={setCurrentView} />}
        {currentView === 'card' && <SatCardGenerator />}
        {currentView === 'meme' && <MemeGenerator />}
      </motion.div>
    </div>
  );
}

export default App;
