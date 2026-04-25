import React from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: 'easeOut' },
  }),
};
import { Sparkles, Image, ArrowRight, Zap, Trophy } from 'lucide-react';
import Logo from './Logo';

function LandingPage({ setCurrentView }) {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-bitcoin-orange rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-bitcoin-gold rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bitcoin-orange/10 border border-bitcoin-orange/30 text-bitcoin-orange text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              For the Ordinals Maxis
            </div>
            
            <h1 className="font-display text-5xl sm:text-7xl font-black mb-6 leading-tight">
              <span className="text-white">Ordinals</span>
              <br />
              <span className="text-gradient">Are Back</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Look up real on chain stats, generate sat cards, and cook Bitcoin native memes. 
              Built for the culture.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('card')}
                className="flex items-center gap-3 px-8 py-4 bg-bitcoin-orange text-black font-bold rounded-xl hover:bg-bitcoin-gold transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                Generate Sat Card
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('meme')}
                className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
              >
                <Image className="w-5 h-5" />
                Open Meme Lab
              </motion.button>
            </div>
          </motion.div>
          
          {/* Stats removed */}
        </div>
      </section>
      
      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for <span className="text-gradient">Bitcoin Culture</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Two powerful tools designed to help you express your Ordinals identity 
              and create viral content for the community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-bitcoin-orange/50 transition-colors cursor-pointer"
              onClick={() => setCurrentView('card')}
            >
              <div className="w-14 h-14 rounded-xl bg-bitcoin-orange/20 flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-bitcoin-orange" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-3">Sat Card Generator</h3>
              <p className="text-gray-400 mb-6">
                Enter any Bitcoin address or inscription ID to query real balance, UTXOs, 
                inscriptions, and sat rarity — then generate a shareable trading card.
              </p>
              <div className="flex items-center gap-2 text-bitcoin-orange font-medium">
                Try it <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={4}
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-bitcoin-orange/50 transition-colors cursor-pointer"
              onClick={() => setCurrentView('meme')}
            >
              <div className="w-14 h-14 rounded-xl bg-bitcoin-gold/20 flex items-center justify-center mb-6">
                <Image className="w-7 h-7 text-bitcoin-gold" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-3">Meme Lab</h3>
              <p className="text-gray-400 mb-6">
                Upload images, add Bitcoin-themed overlays like Laser Eyes and WAGMI frames, 
                position text, and export memes ready for X.
              </p>
              <div className="flex items-center gap-2 text-bitcoin-gold font-medium">
                Try it <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-display font-bold text-white">Ordinals Are Back</span>
          </div>
          <p className="text-gray-500 text-sm">
            made by <a href="https://x.com/frekramp" target="_blank" rel="noopener noreferrer" className="text-bitcoin-orange hover:text-bitcoin-gold transition-colors">@frekramp</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
